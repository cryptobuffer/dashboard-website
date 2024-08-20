import { mapGetters, mapState } from "vuex";
import { claimPoints } from "@/api/booster";
import { sendStoken } from "@/api/login.js";
import { coinMove } from "../../../utils/animation";
export default {
  data() {
    return {
      computedPoints: 0,
      interval: 1000,
      timer: null,
      tgLoading: false,
      unlockLoading: -1,
    };
  },
  computed: {
    ...mapState({
      boosterInfo: (s) => s.moduleBooster.boosterInfo,
    }),
    ...mapGetters([
      "boostLocked",
      "baseRate",
      "boostRate",
      "currentComputed",
      "totalRate",
      "notLogin",
    ]),
    storageBoost() {
      return this.boosterInfo.baseRate.filter((it) => it.name == "storage");
    },
    networkBoost() {
      return this.boosterInfo.baseRate.filter((it) => it.name == "network");
    },
    computeBoost() {
      return this.boosterInfo.baseRate.filter((it) => it.name == "compute");
    },
    storageLocked() {
      return this.storageBoost.length == 0;
    },
    networkLocked() {
      return this.networkBoost.length == 0;
    },
    computingLocked() {
      return this.computeBoost.length == 0;
    },
    asMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
  },

  async created() {
    this.timer = setInterval(() => {
      this.computedPoints =
        this.computedPoints == 0 ? this.currentComputed : this.computedPoints;
      this.computedPoints += (this.totalRate * this.interval) / 3600000;
    }, this.interval);

    if (this.$route.query && this.$route.query.st) {
      const stoken = this.$route.query.st;
      const { data } = await sendStoken(stoken);
      this.onLoginData(data);
    }
  },
  methods: {
    handleStartBoost() {
      if (this.notLogin) {
        localStorage.loginTo = location.pathname + location.search;
        this.$router.push("/login");
      } else {
        this.$emit("handleStartBoost");
      }
    },

    async handleUnlock(index) {
      this.$emit("handleUnlock", index);
    },
    async hanleClaim() {
      try {
        if (this.computedPoints < 1)
          return this.$toast2("Points below 1 unclaimable.", "info");
        const data = await claimPoints();
        console.log(data);
        clearInterval(this.timer);
        this.computedPoints = 0;

        if (this.asMobile) {
          coinMove("mobile-point-send", "mobile-point-receive");
        } else {
          coinMove("point-send", "point-receive");
        }
        await this.$store.dispatch("getBoosterUserInfo");
        this.timer = setInterval(() => {
          this.computedPoints =
            this.computedPoints == 0
              ? this.currentComputed
              : this.computedPoints;
          this.computedPoints += (this.totalRate * this.interval) / 3600000;
        }, this.interval);
      } catch (error) {
        console.log(error);
      }
    },
    onLoginData(data) {
      localStorage.authData = JSON.stringify(data);
      localStorage.token = data.accessToken;
      localStorage.nodeToken = data.nodeToken;
      let query = this.$route.query;
      let queryKeys = Object.keys(query).filter((it) => it != "st");
      let queryObj = {};
      if (queryKeys.length > 0) {
        queryKeys.forEach((it) => {
          queryObj[it] = query[it];
        });
      }
      if (this.$route.query) {
        this.$router.replace({
          path: "/boost",
          query: queryObj,
        });
      }
      location.reload();
    },
  },
};
