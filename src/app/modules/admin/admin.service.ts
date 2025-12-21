import { useQuery } from "mongoose-qb";
import { Transaction } from "../transaction/transaction.model";
import { IsActive, IToAgentStatus, IUser, Role } from "../user/user.interface";
import { ToAgent, User } from "../user/user.model";
import { AppError } from "@/app/errors";
import { HTTP_CODE, rollback, sendMail } from "@/shared";

export const retrieveAllUsers = async (query: Record<string, string>) => {
  return await useQuery<IUser>(User, query, {
    paginate: true,
    sort: true,
    filter: true,
    fields: true,
    search: ["email", "name", "phone"],
    excludes: ["password", "wallet", "auths"],
  });
};

export const blockAndUnblockUser = async (
  userId: string,
  isActive: IsActive
) => {
  let user = await User.findById(userId);

  if (!user)
    throw new AppError(HTTP_CODE.NOT_FOUND, `User not found to ${isActive}`);

  if (Role.SUPER_ADMIN === user.role && isActive === "BLOCKED")
    throw new AppError(
      HTTP_CODE.BAD_REQUEST,
      `${Role.SUPER_ADMIN} account can not be blocked!`
    );

  if (userId === user._id || user.role === "ADMIN")
    throw new AppError(
      HTTP_CODE.BAD_REQUEST,
      `You can not perform this operation!`
    );

  user = await User.findByIdAndUpdate(userId, { isActive });

  if (!user)
    throw new AppError(
      HTTP_CODE.SERVICE_UNAVAILABLE,
      `Failed to ${isActive} user. Try again later!`
    );
};

export const retrieveAllAgentApplication = async (
  query: Record<string, string>
) => {
  const toAgent = await useQuery(ToAgent, query, {
    paginate: true,
    fields: true,
    sort: true,
    filter: true,
    search: ["status"],
    populate: [{ path: "user", select: "name email phone role createdAt" }],
  });
  return toAgent;
};

export const updateToAgentStatus = rollback(
  async (session, requestAgentId: string, status: IToAgentStatus) => {
    let toAgent = await ToAgent.findById(requestAgentId).session(session);

    if (!toAgent) throw new AppError(404, "Agent request was not found!");

    const user = await User.findById(toAgent.user).session(session);

    if (!user)
      throw new AppError(404, "User not found for this agent request!");

    if (toAgent.status === IToAgentStatus.APPROVED)
      throw new AppError(
        HTTP_CODE.BAD_REQUEST,
        `The agent request is already ${IToAgentStatus.APPROVED}!`
      );

    toAgent = await ToAgent.findByIdAndUpdate(
      requestAgentId,
      { status, user: user._id },
      { new: true, runValidators: true, session }
    ).populate({ path: "user", select: "name email phone" });

    if (toAgent!.status === IToAgentStatus.APPROVED) {
      user.role = Role.AGENT;
      await user.save({ session });
    }

    const info = await sendMail({
      subject: "Request for Agent in Neela Wallet API",
      to: user.email,
      template: {
        name: "update-to-agent-status",
        data: {
          name: user.name,
          status: toAgent!.status,
        },
      },
    });

    if (!info.accepted.includes(user.email))
      throw new AppError(
        HTTP_CODE.INTERNAL_SERVER_ERROR,
        `Failed to send email.`
      );

    return toAgent;
  }
);
