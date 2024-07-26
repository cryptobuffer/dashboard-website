import BaseRequest from "./request";

const boosterRequest = new BaseRequest({
  baseURL: process.env.VUE_APP_BOOSTER_URL,
  interceptors: {
    requestInterceptor(config) {
      const token = localStorage.nodeToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    responseInterceptor(res) {
      if (res.data.code == 401 || res.data.code == 500) {
        throw new Error("Access Denied!");
      }
      return res.data;
    },
  },
});

export const fetchPreTaskActivity = async () => {
  return boosterRequest.get({
    url: `/node/activities/pre_tasks`,
  });
};
export const onNext = async (id, payment = null) => {
  return boosterRequest.post({
    url: `/node/activities/${id}/next`,
    data: {
      payment,
    },
  });
};

export const fetchUserBoostInfo = async () => {
  return boosterRequest.get({
    url: "/node/info",
  });
};

export const initBoost = async (code) => {
  return boosterRequest.post({
    url: `/node/create`,
    data: {
      code,
    },
  });
};

export const unlockStage = async (index, inviteCode = null) => {
  const stages = ["storage", "compute", "network"];
  return boosterRequest.post({
    url: `/node/stage/${stages[index]}`,
    data: {
      invite_code: inviteCode,
    },
  });
};

export const claimPoints = async () => {
  return boosterRequest.put({
    url: `/node/claim`,
  });
};

export const fetchPointsHistory = async (page, size = 10) => {
  return boosterRequest.get({
    url: `/node/history?page=${page}&size=${size}`,
  });
};

export const fetchInviteInfo = async () => {
  return boosterRequest.get({
    url: "/node/invite/info",
  });
};

export const fetchLeaderboard = async (page, size = 10) => {
  return boosterRequest.get({
    url: `/node/leaderboard?page=${page}&size=${size}`,
  });
};

export const fetchRemainingExploration = async () => {
  return boosterRequest.get({
    url: "/node/exploration/today",
  });
};

export const fetchStakeInfo = async () => {
  return boosterRequest.get({
    url: "/t4ever/stake/info",
  });
};

export const fetchEverPayHash = async (hash) => {
  return boosterRequest.post({
    url: `/everpay/stake/${hash}`,
  });
};

export const fetchNftLists = async () => {
  return boosterRequest.get({
    url: "/nft/list",
  });
};

export const fetchNftIsStake = async () => {
  return boosterRequest.get({
    url: "/nft/isStake",
  });
};

export const fetchNftBind = async (data) => {
  return boosterRequest.post({
    url: "/nft/bind",
    data,
  });
};

export const fetchDailySign = async () => {
  return boosterRequest.get({
    url: "/node/activities/daily_sign",
  });
};

export const fetchTasks = async () => {
  return boosterRequest.get({
    url: "/node/activities/tasks",
  });
};