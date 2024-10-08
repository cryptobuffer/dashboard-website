<template>
  <div v-if="showComponent">
    <v-dialog
      v-model="firstRechargeDialog"
      max-width="920"
      content-class="claim-dialog"
      persistent
    >
      <div class="first-recharge pa-4 pa-md-10">
        <div class="task-hub-content ml-auto">
          <div
            class="task-hub-title primary--text fw-b text-center text-sm-left"
          >
            {{
              isOverActivityTime
                ? "First Deposit Bonus for LAND!"
                : "Limited-time First Deposit Bonus for LAND!"
            }}
          </div>
          <div class="al-c fw-b py-6" v-if="!isOverActivityTime">
            <span class="mr-4">End Time:</span>
            <time-count-down
              :endTimeStamp="endTime"
              @timeOver="timeOver"
            ></time-count-down>
          </div>
          <div class="fw-b task-hub-text">
            Complete your first deposit to unlock the following benefts.
          </div>
          <div class="fz-14 task-hub-description">starting from $1</div>

          <div
            v-for="(item, index) in firstRechargeItems"
            :key="index"
            class="mt-1 mt-md-4 recharge-item al-c"
          >
            <div class="pa-2 al-c space-btw mr-4 img-icon">
              <img :width="asMobile ? 24 : 40" :src="item.img" alt="" />
            </div>
            <div>
              <div class="primary--text fw-b fz-16 recharge-item-title">
                {{ item.title }}
              </div>
              <div class="recharge-item-description fz-12">
                {{ item.description }}
              </div>
            </div>
          </div>
          <div
            class="d-flex flex-column flex-md-row justify-center mt-2 mt-md-8"
            style="gap: 8px"
          >
            <div
              class="deposit-now-btn primary al-c justify-center flex-2 cursor-p"
              v-ripple
              @click="handleDeposit"
            >
              <span class="fz-14 fw-b">Deposit now</span>
              <img
                width="16"
                class="ml-1"
                src="/img/svg/new-user-activity/right-circle.svg"
                alt=""
              />
            </div>
            <div
              class="give-up-btn fz-14 cursor-p ta-c"
              v-ripple
              @click="firstRechargeDialog = false"
            >
              Give up the benefits
            </div>
          </div>
        </div>
      </div>
    </v-dialog>

    <v-dialog
      v-model="showDialog"
      max-width="920"
      content-class="claim-dialog"
      persistent
    >
      <div class="d-flex mint-content pa-4 pa-md-10 pos-r">
        <div class="pos-a registe-gift al-c cursor-p">
          <img
            width="260"
            src="/img/svg/new-user-activity/registe-gift.svg"
            alt=""
          />
        </div>
        <div class="mint-box ml-auto">
          <h3 class="mint-title fw-b primary--text">Activate Your Account</h3>
          <div class="mint-description fz-14">
            Welcome to 4EVERLAND. You are in a trial status and can only access
            limited product functionalities. Please complete the on-chain
            identity registration below to unlock the full potential of your
            Web3 journey.
          </div>

          <div class="mt-2 mt-md-6">
            <h3 class="fz-16">Unlock new benefits</h3>
            <div class="d-flex flex-column flex-md-row">
              <v-row no-gutters>
                <v-col
                  cols="12"
                  sm="6"
                  v-for="item in items"
                  :key="item.name"
                  class="d-flex align-center pa-1"
                >
                  <div class="img-icon al-c space-btw pa-2">
                    <img :height="asMobile ? 24 : 40" :src="item.img" alt="" />
                  </div>
                  <div class="ml-3 fz-14">
                    {{ item.name }}
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>

          <div
            class="d-flex flex-column flex-md-row mt-2 mt-md-6"
            style="gap: 8px"
          >
            <div class="flex-2">
              <e-menu
                ref="menu"
                top
                :close-on-content-click="false"
                left
                open-on-hover
                @input="
                  (val) => {
                    menuOpen = val;
                  }
                "
              >
                <div
                  slot="ref"
                  class="mint-btn primary al-c justify-center fw-b fz-14 cursor-p"
                >
                  <span>Activate now</span>
                  <img
                    class="ml-1"
                    width="16"
                    :src="
                      menuOpen
                        ? '/img/svg/rewardHub/down-arrow.svg'
                        : '/img/svg/rewardHub/up-arrow.svg'
                    "
                    alt=""
                  />
                </div>

                <v-list>
                  <div
                    class="claim-chain-list d-flex align-center flex-column pa-4 pb-2"
                  >
                    <template v-for="(item, i) in claimList">
                      <div
                        :key="item.type"
                        class="pa-3 claim-chain-item mb-2 cursor-p al-c"
                        :class="
                          claimList.length % 2 != 0 && claimList.length - 1 == i
                            ? 'last-item'
                            : ''
                        "
                        @click="handleTypeClaim(item)"
                      >
                        <img :src="item.icon" width="24" height="24" alt="" />
                        <span class="ml-3 fz-14">
                          {{ item.name }}
                        </span>
                        <e-tooltip top v-if="item.tips">
                          <v-icon
                            slot="ref"
                            size="18"
                            color="#999"
                            class="pa-1 d-ib"
                            >mdi-alert-circle-outline</v-icon
                          >
                          <span>{{ item.tips }}</span>
                        </e-tooltip>
                      </div>
                    </template>
                  </div>
                </v-list>
              </e-menu>
            </div>
            <div
              class="skip-btn fz-14 cursor-p flex-1"
              @click="showDialog = false"
            >
              Skip
            </div>
          </div>
        </div>
      </div>
    </v-dialog>
    <e-register-share ref="share"></e-register-share>
    <e-no-register-tip
      @showFirstRecharge="firstRechargeDialog = true"
      @showDialog="showDialog = true"
    ></e-no-register-tip>
  </div>
</template>

<script>
import mixin from "@/pages/more/mixin-register";
import timeCountDown from "./time-count-down.vue";
import { bus } from "@/utils/bus";
import { mapState } from "vuex";
import {
  ChapelLandRecharge,
  ArbitrumLandRecharge,
  zkSyncLandRecharge,
  polygonZkEVMRecharge,
  lineaRecharge,
  blastRecharge,
  optimismRecharge,
  GoerliLandRecharge,
  MumbaiLandRecharge,
  opBNBRecharge,
  taikoRecharge,
} from "../../plugins/pay/contracts/contracts-addr";

export default {
  mixins: [mixin],
  components: {
    timeCountDown,
  },
  computed: {
    ...mapState({
      onChain: (s) => s.onChain,
    }),
    firstRechargeItems() {
      return [
        {
          img: "/img/svg/new-user-activity/upgrade.svg",
          title: "Upgrade your account for free",
          description:
            "Upgrade to a Standard user to access increased storage capacity and computing resources.",
        },
        {
          img: "/img/svg/new-user-activity/diamond.svg",
          title: this.isOverActivityTime ? "100Points" : "300 Points",
          description: this.isOverActivityTime
            ? "Complete your first deposit and receive 100 points!"
            : "Limited-Time! Complete your first deposit before December 1st, and receive 300 points!",
        },
        {
          img: "/img/svg/new-user-activity/lock.svg",
          title: "Unlock Exclusive Features",
          description:
            "Deposit to activate dedicated gateway functionality and gain priority access to new feature experiences.",
        },
      ];
    },
    showComponent() {
      return (
        !/quest/g.test(this.$route.path) &&
        !/claim/g.test(this.$route.path) &&
        !/boost/g.test(this.$route.path)
      );
    },
    asMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
  },
  data() {
    return {
      items: [
        {
          img: "/img/svg/rewardHub/web31.svg",
          name: "Web3 Identity",
        },
        {
          img: "/img/svg/rewardHub/ownership1.svg",
          name: "Ownership of data",
        },
        {
          img: "/img/svg/rewardHub/enhanced1.svg",
          name: "Enhanced product functionalities",
        },
        {
          img: "/img/svg/rewardHub/fee_resource1.svg",
          name: "Access to additional free resources",
        },
      ],
      showDialog: false,
      firstRechargeDialog: false,
      accountExists: false,
      claimList: [
        {
          name: "Polygon",
          icon: require("/public/img/svg/billing/ic-polygon-0.svg"),
          type: "Polygon",
          contractAddr: MumbaiLandRecharge,
        },
        {
          name: "Polygon zkEVM",
          icon: require("/public/img/svg/billing/ic-polygon-zkEVM.svg"),
          type: "PolygonZkEVM",
          contractAddr: polygonZkEVMRecharge,
        },
        {
          name: "zkSync Era",
          icon: require("/public/img/svg/logo-no-letters.svg"),
          type: "zkSyncV2",
          contractAddr: zkSyncLandRecharge,
        },
        {
          name: "zkSync Lite",
          icon: require("/public/img/svg/logo-no-letters.svg"),
          type: "zkSync",
          tips: "Please ensure that you have sufficient ETH in zkSync Lite. Interaction with the zkSync network will rely on cross-chain communication services to complete on-chain identity registration on Polygon.",
          contractAddr: "",
        },
        {
          name: "BNB Smart Chain",
          icon: require("/public/img/svg/billing/ic-opbnb-test.svg"),
          type: "BSC",
          contractAddr: ChapelLandRecharge,
        },
        {
          name: "opBNB",
          icon: require("/public/img/svg/billing/ic-opbnb-test.svg"),
          type: "OpBNB",
          contractAddr: opBNBRecharge,
        },
        {
          name: "Arbitrum",
          icon: require("/public/img/svg/billing/ic-arbitrum.png"),
          type: "Arbitrum",
          contractAddr: ArbitrumLandRecharge,
        },
        {
          name: "Optimism",
          icon: require("/public/img/svg/billing/ic-optimism.svg"),
          type: "Optimism",
          contractAddr: optimismRecharge,
        },
        {
          name: "Ethereum",
          icon: require("/public/img/svg/billing/ic-ethereum.svg"),
          type: "Ethereum",
          contractAddr: GoerliLandRecharge,
        },
        {
          name: "Linea",
          icon: require("/public/img/svg/billing/ic-linea.svg"),
          type: "Linea",
          contractAddr: lineaRecharge,
        },
        {
          name: "Blast",
          icon: require("/public/img/svg/billing/ic-blast.svg"),
          type: "Blast",
          contractAddr: blastRecharge,
        },
        {
          name: "Taiko",
          icon: require("/public/img/svg/billing/ic-taiko.svg"),
          type: "Taiko",
          contractAddr: taikoRecharge,
        },
      ],
      firstRechargeInfo: {
        timestamp: 0,
        firstRecharge: true,
      },
      menuOpen: false,
      isOverActivityTime: true,
      endTime: 0,
    };
  },
  async created() {
    if (localStorage.token) {
      await this.$store.dispatch("checkOnChain");
      await this.handleCheckFirstCharge();
      this.loginTrigger();
    }
    bus.$on("showDialog", () => {
      this.showDialog = true;
    });
  },
  methods: {
    onAnimation() {
      this.showDialog = false;
      this.$refs.share.showDialog = true;
    },
    async handleTypeClaim(item) {
      const type = item.type;
      try {
        this.$loading();
        const register = await this.isRegister();
        if (register) {
          this.onAnimation();
          return this.$emit("claimCompeleted");
        }
        let claimStatus = null;
        if (type == "zkSync") {
          claimStatus = await this.handleZkClaim();
        } else if (type == "zkSyncV2") {
          console.log("zysyncv2");
          claimStatus = await this.handleOtherChainClaim({
            ...item,
            type: "zkSync",
          });
        } else {
          claimStatus = await this.handleOtherChainClaim(item);
        }
        if (claimStatus) {
          this.onAnimation();
          this.claimCompeleted();
        }
      } catch (error) {
        console.log(error);
      }
      this.$loading.close();
    },

    async claimCompeleted() {
      try {
        const { data } = await this.$http.get(
          "$auth/self-handled-register-apply"
        );
        this.$setState({
          onChain: data.handled,
        });
      } catch (error) {
        console.log(error);
      }
    },

    async handleCheckFirstCharge() {
      try {
        const { data } = await this.$http.get(
          "$bill-consume/common/first/recharge"
        );
        this.firstRechargeInfo = data;
        this.endTime = Number(this.firstRechargeInfo.timestamp) + 86400 * 3;
        this.isOverActivityTime = +new Date() >= this.endTime * 1000;
        this.$store.commit("SET_FIRST_RECHARGE", data.firstRecharge);
      } catch (error) {
        console.log(error);
      }
    },

    loginTrigger() {
      const loginTrigger = localStorage.getItem("loginTrigger");
      if (loginTrigger == "1") return;
      if (!this.firstRechargeInfo.firstRecharge) {
        if (this.onChain) {
          this.firstRechargeDialog = true;
        } else {
          this.showDialog = true;
        }
        localStorage.setItem("loginTrigger", "1");
      }
    },
    handleDeposit() {
      this.firstRechargeDialog = false;
      this.$router.push("/billing/deposit");
    },
    timeOver() {
      this.isOverActivityTime = true;
    },
  },
};
</script>

<style>
.claim-dialog {
  border-radius: 16px;
  overflow: inherit;
}
.v-list.v-sheet.theme--light {
  padding: 0;
}
.v-menu__content.theme--light.v-menu__content--fixed {
  box-shadow: none;
  border-radius: 8px;
  border: 1px solid rgba(203, 213, 225, 0.25);
}
</style>
<style lang="scss" scoped>
@media screen and (max-width: 600px) {
  .first-recharge {
    background: none !important;
  }
  .mint-title {
    font-size: 20px !important;
  }
  .mint-content {
    background: none !important;
  }
  .mint-description {
    font-size: 12px !important;
  }

  .task-hub-title {
    font-size: 20px !important;
  }
  .task-hub-text {
    font-size: 14px;
  }
  .give-up-btn {
    padding: 12px !important;
  }
  .deposit-now-btn {
    padding: 12px !important;
  }
  .recharge-item-title {
    font-size: 14px !important;
  }
}

.task-hub-content {
  max-width: 560px;
  width: 100%;
  .task-hub-title {
    font-size: 24px;
  }
  .task-hub-description {
    color: #64748b;
  }
}
.claim-chain-list {
  max-width: 560px;
  width: 100%;
  height: 304px;
  overflow-y: scroll;
  box-sizing: border-box;
}
.claim-chain-item {
  width: 100%;
  box-sizing: border-box;
  background: rgba(140, 140, 161, 0.05);
  color: #0e0e2c;
}

.claim-chain-item.last-item:last-of-type {
  width: 100%;
}
.img-icon {
  border-radius: 50%;
  background-color: #eef4ff;
}

.first-recharge {
  background: url("/img/bg/share/first-recharge-bg.png") no-repeat;
  .give-up-btn {
    padding: 16px 38px 16px 37px;
    color: #64748b;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: #fff;
  }
  .deposit-now-btn {
    color: #fff;
    padding: 16px 38px 16px 37px;
    border-radius: 8px;
  }
}

.mint-content {
  background: url("/img/bg/share/mint-bg.png") no-repeat;
  background-position: -30px;
  background-size: 60%;
  .mint-box {
    max-width: 560px;
    width: 100%;
    .mint-title {
      font-size: 24px;
    }
    .mint-description {
      line-height: normal;
      color: #64748b;
    }
  }
}

.skip-btn {
  color: #64748b;
  border-radius: 8px;
  text-align: center;
  padding: 8px 0;
  border: 1px solid #cbd5e1;
  background: #fff;
}
.mint-btn {
  padding: 12px 0;
  color: #fff;
  border-radius: 8px;
}
.registe-gift {
  left: 50%;
  transform: translateX(-50%);
  top: -50px;
}
</style>
