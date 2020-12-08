let list_user_online = [];

module.exports.push = (username) => {
  list_user_online.push(username);
};

module.exports.remove = (username) => {
  const index = list_user_online.indexOf(username);
  if (index > -1) {
    list_user_online.splice(index, 1);
  }
};

module.exports.getAll = () => {
  return list_user_online;
};
