const { Account } = require("@app/models");
const _ = require('lodash');
class UserRole {
  constructor(username) {
    this.username = username;
  }
  async check(existRole, notExistRole = []) {
    const users = await Account.aggregate([
      { $match: { username: this.username }},
      { $match: { active: true } },
      { $unwind: "$roles" },
      {
        $lookup: {
          from: "roles",
          localField: "roles",
          foreignField: "_id",
          as: "roles",
        },
      },
      { $addFields: { roles: "$roles.code" } },
      { $unwind: "$roles" },
      {
        $project: {
          _id: "$_id",
          roles: "$roles",
          family: { $ifNull: ["$family", null] },
        },
      },
      {
        $group: {
          _id: "$_id",
          family: { $first: "$family" },
          roles: {
            $push: "$roles",
          },
        },
      },
    ]);
    if (!users || users.length <= 0) {
      return false;
    }
    const { roles } =  _.head(users);
    const exist = roles.some((r) => existRole.includes(r));
    const notExist = roles.some((r) => notExistRole.includes(r));
    if (exist && !notExist) {
      return true;
    }
    return false;
  }
}

module.exports = UserRole;
