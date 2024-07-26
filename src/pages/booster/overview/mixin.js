import { mapGetters, mapState } from "vuex";
import { unlockStage, claimPoints } from "@/api/booster";
export default {
  data() {
    return {
      computedPoints: 0,
      interval: 2000,
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
  },

  created() {
    setInterval(() => {
      this.computedPoints =
        this.computedPoints == 0 ? this.currentComputed : this.computedPoints;
      this.computedPoints += (this.totalRate * this.interval) / 3600000;
    }, this.interval);
  },
  methods: {
    handleStartBoost() {
      if (this.notLogin) {
        this.$router.push("/login");
      } else {
        this.$emit("handleStartBoost");
      }
    },
    async handleUnlock(index) {
      try {
        await unlockStage(index);
        this.$store.dispatch("getBoosterUserInfo");
      } catch (error) {
        console.log(error);
      }
    },
    async hanleClaim() {
      try {
        const data = await claimPoints();
        console.log(data);
        this.computedPoints = 0;
        this.$store.dispatch("getBoosterUserInfo");
      } catch (error) {
        console.log(error);
      }
    },
  },
};