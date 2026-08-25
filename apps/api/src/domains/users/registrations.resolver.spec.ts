import "reflect-metadata";

import { RoleEnum } from "@api/domains/users/role.enum";
import { RoleService } from "@api/domains/auth/role.service";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { SessionAuthGuard } from "@api/domains/auth/session-auth.guard";
import { UserStatusEnum } from "@api/domains/users/user-status.enum";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { RegistrationsResolver } from "./registrations.resolver";

const adminUser: User = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin",
  avatarUrl: null,
  role: RoleEnum.Admin,
  status: UserStatusEnum.Active,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const memberUser: User = { ...adminUser, id: "user-1", email: "user@example.com", role: RoleEnum.User };

const pendingUser: User = {
  ...adminUser,
  id: "pending-1",
  email: "pending@example.com",
  role: RoleEnum.User,
  status: UserStatusEnum.Pending,
};

describe("RegistrationsResolver (integration)", () => {
  let app: INestApplication;
  let listRegistrations: ReturnType<typeof vi.fn>;
  let approveRegistration: ReturnType<typeof vi.fn>;
  let rejectRegistration: ReturnType<typeof vi.fn>;
  let resendApprovalEmail: ReturnType<typeof vi.fn>;
  let removeUserByAdmin: ReturnType<typeof vi.fn>;
  let reactivateUserByAdmin: ReturnType<typeof vi.fn>;
  let findById: ReturnType<typeof vi.fn>;

  const approvedUser: User = { ...pendingUser, id: "approved-1", status: UserStatusEnum.Active };
  const rejectedUser: User = { ...pendingUser, id: "rejected-1", status: UserStatusEnum.Rejected };
  const deactivatedUser: User = { ...pendingUser, id: "deactivated-1", status: UserStatusEnum.Deactivated };

  beforeAll(async () => {
    listRegistrations = vi.fn().mockResolvedValue([pendingUser]);
    approveRegistration = vi.fn().mockResolvedValue({ ...pendingUser, status: UserStatusEnum.Active });
    rejectRegistration = vi.fn().mockResolvedValue({ ...pendingUser, status: UserStatusEnum.Rejected });
    resendApprovalEmail = vi.fn().mockResolvedValue(approvedUser);
    removeUserByAdmin = vi.fn().mockResolvedValue({ ...approvedUser, status: UserStatusEnum.Deactivated });
    reactivateUserByAdmin = vi.fn().mockResolvedValue({ ...deactivatedUser, status: UserStatusEnum.Active });
    findById = vi.fn().mockImplementation((id: string) => {
      if (id === adminUser.id) return Promise.resolve(adminUser);
      if (id === memberUser.id) return Promise.resolve(memberUser);
      return Promise.resolve(null);
    });

    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLModule.forRoot<ApolloDriverConfig>({ driver: ApolloDriver, autoSchemaFile: true })],
      providers: [
        RegistrationsResolver,
        RolesGuard,
        RoleService,
        Reflector,
        {
          provide: UserService,
          useValue: {
            listRegistrations,
            approveRegistration,
            rejectRegistration,
            resendApprovalEmail,
            removeUserByAdmin,
            reactivateUserByAdmin,
            findById,
          },
        },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const gqlCtx = GqlExecutionContext.create(ctx);
          const req = gqlCtx.getContext<{ req: Request & { headers: Record<string, string>; user?: unknown } }>().req;
          const userId = req.headers["x-user-id"];
          if (!userId) throw new UnauthorizedException();
          req.user = { userId };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  afterEach(() => {
    listRegistrations.mockClear();
    approveRegistration.mockClear();
    rejectRegistration.mockClear();
    resendApprovalEmail.mockClear();
    removeUserByAdmin.mockClear();
    reactivateUserByAdmin.mockClear();
  });

  it("registrations returns pending users for an admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: "{ registrations(status: Pending) { id status } }" });

    expect(res.statusCode).toBe(200);
    expect(listRegistrations).toHaveBeenCalledWith(UserStatusEnum.Pending, undefined);
    expect(res.body.data.registrations).toEqual([{ id: pendingUser.id, status: "Pending" }]);
  });

  it("registrations forwards the search argument to the service", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: '{ registrations(search: "ana") { id } }' });

    expect(res.statusCode).toBe(200);
    expect(listRegistrations).toHaveBeenCalledWith(undefined, "ana");
  });

  it("registrations is forbidden for a non-admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", memberUser.id)
      .send({ query: "{ registrations { id } }" });

    expect(res.body.errors).toBeDefined();
    expect(res.body.data).toBeNull();
  });

  it("approveRegistration approves a pending user for an admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { approveRegistration(userId: "${pendingUser.id}") { id status } }` });

    expect(res.statusCode).toBe(200);
    expect(approveRegistration).toHaveBeenCalledWith(pendingUser.id);
    expect(res.body.data.approveRegistration.status).toBe("Active");
  });

  it("rejectRegistration rejects a pending user for an admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { rejectRegistration(userId: "${pendingUser.id}") { id status } }` });

    expect(res.statusCode).toBe(200);
    expect(rejectRegistration).toHaveBeenCalledWith(pendingUser.id);
    expect(res.body.data.rejectRegistration.status).toBe("Rejected");
  });

  it("approveRegistration surfaces BadRequestException for a non-pending user", async () => {
    approveRegistration.mockRejectedValueOnce(
      new BadRequestException("Only pending registrations can be approved or rejected."),
    );

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { approveRegistration(userId: "${adminUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/pending/i);
  });

  it("approveRegistration is forbidden for a non-admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", memberUser.id)
      .send({ query: `mutation { approveRegistration(userId: "${pendingUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(approveRegistration).not.toHaveBeenCalledWith(pendingUser.id);
  });

  it("resendApprovalEmail resends the approval email for an active user for an admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { resendApprovalEmail(userId: "${approvedUser.id}") { id status } }` });

    expect(res.statusCode).toBe(200);
    expect(resendApprovalEmail).toHaveBeenCalledWith(approvedUser.id);
    expect(res.body.data.resendApprovalEmail.status).toBe("Active");
  });

  it("resendApprovalEmail surfaces BadRequestException for a non-active user", async () => {
    resendApprovalEmail.mockRejectedValueOnce(
      new BadRequestException("Only active users can have their approval email resent."),
    );

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { resendApprovalEmail(userId: "${pendingUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/active/i);
  });

  it("resendApprovalEmail is forbidden for a non-admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", memberUser.id)
      .send({ query: `mutation { resendApprovalEmail(userId: "${approvedUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(resendApprovalEmail).not.toHaveBeenCalledWith(approvedUser.id);
  });

  it("removeUser deactivates a user for an admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { removeUser(userId: "${approvedUser.id}") { id status } }` });

    expect(res.statusCode).toBe(200);
    expect(removeUserByAdmin).toHaveBeenCalledWith(adminUser.id, approvedUser.id);
    expect(res.body.data.removeUser.status).toBe("Deactivated");
  });

  it("removeUser surfaces BadRequestException when targeting yourself", async () => {
    removeUserByAdmin.mockRejectedValueOnce(
      new BadRequestException("Use account settings to deactivate your own account."),
    );

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { removeUser(userId: "${adminUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/own account/i);
  });

  it("removeUser surfaces BadRequestException for an already-deactivated user", async () => {
    removeUserByAdmin.mockRejectedValueOnce(new BadRequestException("User not found or already deactivated."));

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { removeUser(userId: "${approvedUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/deactivated/i);
  });

  it("removeUser is forbidden for a non-admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", memberUser.id)
      .send({ query: `mutation { removeUser(userId: "${approvedUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(removeUserByAdmin).not.toHaveBeenCalled();
  });

  it("removeUser also deactivates a rejected user for an admin caller", async () => {
    removeUserByAdmin.mockResolvedValueOnce({ ...rejectedUser, status: UserStatusEnum.Deactivated });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { removeUser(userId: "${rejectedUser.id}") { id status } }` });

    expect(res.statusCode).toBe(200);
    expect(removeUserByAdmin).toHaveBeenCalledWith(adminUser.id, rejectedUser.id);
    expect(res.body.data.removeUser.status).toBe("Deactivated");
  });

  it("reactivateUser reactivates a deactivated user for an admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { reactivateUser(userId: "${deactivatedUser.id}") { id status } }` });

    expect(res.statusCode).toBe(200);
    expect(reactivateUserByAdmin).toHaveBeenCalledWith(deactivatedUser.id);
    expect(res.body.data.reactivateUser.status).toBe("Active");
  });

  it("reactivateUser surfaces BadRequestException for a non-deactivated user", async () => {
    reactivateUserByAdmin.mockRejectedValueOnce(new BadRequestException("Only deactivated users can be reactivated."));

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", adminUser.id)
      .send({ query: `mutation { reactivateUser(userId: "${approvedUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/deactivated/i);
  });

  it("reactivateUser is forbidden for a non-admin caller", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("x-user-id", memberUser.id)
      .send({ query: `mutation { reactivateUser(userId: "${deactivatedUser.id}") { id } }` });

    expect(res.body.errors).toBeDefined();
    expect(reactivateUserByAdmin).not.toHaveBeenCalled();
  });
});
