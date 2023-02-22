<template>
  <div class="pos-r">
    <e-right-opt-wrap fix style="top: -30px">
      <div class="al-c">
        <v-select
          class="ipfs-input hide-msg mr-4"
          outlined
          :items="items"
          dense
          @change="fTypeChange"
          v-model="seleted"
        ></v-select>

        <e-custom-date-picker
          @date="handleDate"
          :items="dType"
          selected="DAY_1"
        ></e-custom-date-picker>
      </div>
    </e-right-opt-wrap>

    <v-skeleton-loader
      v-if="!list"
      type="article"
      style="max-width: 400px; min-height: 300px"
    ></v-skeleton-loader>
    <e-empty v-else-if="!list.length" class="pt-10">No Logs</e-empty>
    <template v-else>
      <div class="al-c mb-5" v-for="it in pagiList" :key="it.id">
        <!-- <div class="bdrs-100 bd-1">
        </div> -->
        <e-avatar :diameter="34" :address="it.addr"></e-avatar>

        <div class="ml-4 fz-14">
          <div>
            <span>{{ it.label }}</span>
            <span class="ml-5">{{ it.desc }}</span>
          </div>
          <div class="gray mt-1 fz-12">
            <span>{{ new Date(it.operateAt * 1e3).format() }}</span>
            <template v-if="it.path">
              <span class="ml-2">in</span>
              <e-link class="ml-2" :href="it.link">
                <u class="gray">{{ it.path }}</u>
              </e-link>
            </template>
          </div>
        </div>
      </div>
    </template>
    <e-pagi class="pa-5" v-model="page" :limit="limit" :total="total" />
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      userInfo: (s) => s.userInfo,
    }),
    asMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    path() {
      return this.$route.path;
    },
    pagiList() {
      const list = JSON.parse(JSON.stringify(this.list));
      if (this.list.length) {
        const curPageList = list.splice(
          (this.page - 1) * this.limit,
          this.limit
        );
        return curPageList;
      }
      return [];
    },
  },
  data() {
    return {
      list: null,
      page: 1,
      total: 0,
      limit: 10,
      start: "2022-7-27".toDate() * 1,
      items: [
        { text: "All", value: "ALL" },
        { text: "Owner", value: "OWNER" },
        { text: "Member", value: "MEMBER" },
      ],
      seleted: "ALL",
      dType: [
        { text: "Past 24h", value: "DAY_1" },

        { text: "Past 30Day", value: "DAY_30" },
      ],
      dTypeSelected: "DAY_1",
    };
  },
  watch: {
    path() {
      if (this.path == this.initPath) {
        this.getList();
      }
    },
  },
  mounted() {
    this.initPath = this.path;
    this.getList();
  },
  methods: {
    getDesc(it) {
      const act = it.action;
      let obj = {};
      try {
        obj = JSON.parse(it.message || "{}");
      } catch (error) {
        // obj = it.message;
        console.log(it, error.message);
      }
      const utils = this.$utils;
      if (act == "OAUTH_REGISTER_DRIP") {
        it.desc = "Got airdrop resources for new users";
        it.path = "Resource Transaction History";
        it.link = "/resource/bills";
      } else if (act == "OAUTH_EXCLUSIVE_DRIP") {
        it.desc = `Got a exclusive ${obj.name} resources`;
      } else if (act == "OAUTH_FIRST_LOGIN") {
        it.desc = "Welcome to 4EVERLAND";
        it.path = "Overview";
        it.link = "/overview";
      } else if (act == "OAUTH_BIND_GITHUB") {
        it.desc = "Connected Github account";
        it.path = "Settings";
        it.link = "/settings";
      } else if (act == "BILL_RECHARGE") {
        it.desc = `Deposited ${utils.cutFixed(obj.amount, 4)} USDC`;
      } else if (act == "BILL_WITHDRAW") {
        it.desc = `Withdrew ${utils.cutFixed(obj.amount, 4)} USDC`;
      } else if (act == "BILL_PURCHASED") {
        const info = utils.getPurchase(obj.type, obj.incremental);
        it.desc = `Purchased ${info.amount} ${info.unit || "for"} ${info.name}`;
        if (obj.time > 0)
          it.desc += ` until ${new Date(obj.time * 1e3).format("date")}`;
      } else if (
        act == "HOSTING_ADD_DOMAIN" ||
        act == "HOSTING_DELETE_DOMAIN"
      ) {
        console.log(obj);
        it.desc =
          (/add/i.test(act) ? "added" : "deleted") +
          " domain " +
          (obj.domain || obj.domains[0]);
      } else if (act == "HOSTING_REDEPLOY_PROJECT") {
        it.desc = "Redeployed project " + obj.projectName;
      } else if (act == "HOSTING_DELETE_PROJECT") {
        it.desc = "Deleted project " + obj.projectName;
        it.path = "Hosting";
        it.link = "/hosting/projects";
      } else if (act == "HOSTING_CREATE_PROJECT") {
        it.desc = "Created project " + obj.projectName;
      } else if (act == "HOSTING_GENERATE_CLI_TOKEN") {
        it.desc = "Generated Hosting Auth Token";
        it.path = "Hosting Auth Tokens";
        it.link = "/hosting/auth-tokens";
      } else if (act == "BUCKET_GENERATE_ACCESS_KEY") {
        it.desc = "Generated an Access Key";
        it.path = "Bucket Access Keys";
        it.link = "/bucket/access-keys";
      } else if (act == "BUCKET_DELETE") {
        it.desc = "Deleted bucket " + obj.bucket;
      } else if (act == "BUCKET_CREATE") {
        it.desc = "Created bucket " + obj.bucket;
      } else if (act == "BUCKET_ADD_DOMAIN") {
        it.desc = "Added domain " + obj.domain;
      } else if (act == "BUCKET_DELETE_DOMAIN") {
        it.desc = "Deleted domain " + obj.map((it) => it.domain).join(", ");
      } else if (act == "IPNS_MANAGER_GENERATE") {
        it.desc = "Generated an IPNS named " + obj.name;
      } else if (act == "IPNS_MANAGER_PUBLISH") {
        it.desc = "Published  an IPNS named " + obj.name;
      } else if (act == "IPNS_MANAGER_DELETE") {
        it.desc = "Deleted  an IPNS named " + obj.name;
      } else if (act == "IPNS_MANAGER_AUTH_TOKEN_GENERATE") {
        it.desc = "Generated an Auth Token";
      } else if (act == "IPNS_MANAGER_AUTH_TOKEN_DELETE") {
        it.desc = "Deleted an Auth Token";
      } else if (act == "BUCKET_SNAPSHOT") {
        it.desc =
          "Snapshotted a folder named " +
          obj.prefix.split("/")[obj.prefix.split("/").length - 2];
      } else if (act == "BUCKET_PUBLISH_SNAPSHOT") {
        it.desc =
          "Published a snapshot named " +
          obj.prefix.split("/")[obj.prefix.split("/").length - 2];
      } else if (act == "BUCKET_DELETE_SNAPSHOT") {
        it.desc =
          "Deleted a snapshot named " +
          obj.prefix.split("/")[obj.prefix.split("/").length - 2];
      } else if (act == "BUCKET_RESET_API_SECRET") {
        it.desc = "Resetted an API Secret";
        it.path = "Bucket Access Keys";
        it.link = "/bucket/access-keys";
      } else if (act == "GATEWAY_GENERATE") {
        it.desc = `Generate a dedicated gateway named ${obj.name}.4everland.link`;
      } else if (act == "GATEWAY_DELETE") {
        it.desc = `Deleted a gateway named ${obj.name}.4everland.link`;
      } else if (act == "REWARD_HUB_USED_GIFT_VOUCHER") {
        it.desc = `Redeemed a Credit`;
        it.path = "Resource Billing";
        it.link = "/resource/bills";
      } else if (act == "REWARD_HUB_USED_RESOURCE_VOUCHER") {
        it.desc = `Redeemed a Resource Voucher`;
        it.path = "Resource Billing";
        it.link = "/resource/bills";
      } else if (act == "OAUTH_UPDATE_TEAM_NAME") {
        if (obj.type == "name") {
          it.desc = `Changed the name of the collaboration account to ${obj.name}`;
        } else {
          it.desc = "Changed the picture of the collaboration account";
        }
        it.path = "Account Configuration";
        it.link = "/account/config";
      } else if (act == "OAUTH_EXIT_TEAM") {
        it.desc = `Logging out of the collaborative account`;
        it.path = "Member Management";
        it.link = "/account/member";
      } else if (act == "OAUTH_DISABLE_MEMBER") {
        it.desc = `Disabled collaboration permissions for ${obj.name}`;
        it.path = "Member Management";
        it.link = "/account/member";
      } else if (act == "OAUTH_UPDATE_MEMBER_ACCESS") {
        it.desc = `Changed collaboration permissions for ${obj.name}`;
        it.path = "Member Management";
        it.link = "/account/member";
      } else if (act == "OAUTH_ENABLE_MEMBER") {
        it.desc = `Unblocked collaboration permissions for ${obj.name}`;
        it.path = "Member Management";
        it.link = "/account/member";
      } else if (act == "OAUTH_REMOVE_MEMBER") {
        it.desc = `Removed collaboration permissions for ${obj.name}`;
        it.path = "Member Management";
        it.link = "/account/member";
      } else if (act == "REWARD_HUB_USED_RESOURCE_VOUCHER") {
        it.desc = `Redeemed a Resource Voucher`;
        it.path = "Resource Billing";
        it.link = "/resource/bills";
      } else {
        console.log(act, it);
        it.desc = act;
      }
      if (!it.path) {
        if (/^bill/i.test(act) || act == "OAUTH_EXCLUSIVE_DRIP") {
          it.path = "Resource Transaction History";
          it.link = "/resource/bills";
        } else if (/^hosting.*project$/i.test(act) && obj.projectName) {
          it.path = "Hosting " + obj.projectName;
          it.link = `/hosting/project/${obj.projectName}/${obj.projectId}`;
        } else if (/^hosting.*domain$/i.test(act)) {
          const name = obj.projectName || obj.projectNames[0];
          const id = obj.projectId || obj.projectIds[0];
          it.path = "Hosting " + name;
          it.link = `/hosting/project/${name}/${id}`;
        } else if (/bucket/i.test(act)) {
          if (/domain/i.test(act)) {
            it.path = "Bucket Domains";
            it.link = "/bucket/domains";
          } else if (/snapshot/i.test(act)) {
            it.path = "Bucket " + obj.bucket;
            it.link = `/bucket/storage/${obj.bucket}/?tab=snapshots`;
          } else {
            it.path = "Bucket";
            it.link = "/bucket/storage/";
          }
        } else if (/ipns_manager/i.test(act)) {
          if (/ipns_manager_auth/i.test(act)) {
            it.path = "Gateway Auth Token";
            it.link = "/gateway/auth-token";
          } else {
            it.path = "Gateway IPNS Manager";
            it.link = "/gateway/ipns";
          }
        } else if (/gateway/i.test(act)) {
          it.path = "Gateway Dedicated Gateway";
          it.link = "/gateway/list";
        }
      }
    },
    async getList() {
      try {
        if (this.list) {
          this.$loading();
        }
        const api = this.$inDev ? "https://log.foreverland.xyz" : "";
        const { data } = await this.$http2.get(
          api + "/user/activity/team/action/logs",
          {
            params: {
              fType: this.seleted,
              dType: this.dTypeSelected,
            },
          }
        );
        this.total = data.total;
        const list = data.list.map((it) => {
          if (!it.memberName && !it.currentUid) {
            it.addr = this.userInfo.username;
          } else {
            it.addr = it.memberName || it.currentUid;
          }

          it.label = it.addr.cutStr(6, 4);
          this.getDesc(it);
          return it;
        });
        this.list = list;
        setTimeout(() => {
          window.jdenticon();
        }, 100);
      } catch (error) {
        console.log(error);
      }
      this.$loading.close();
    },
    fTypeChange() {
      this.page = 1;
      if (typeof this.dTypeSelected == "number") {
        this.handleDate(this.dTypeSelected);
      } else {
        this.getList();
      }
    },
    async handleDate(val) {
      this.dTypeSelected = val;
      this.page = 1;
      if (typeof val == "string") return this.getList();
      try {
        if (this.list) {
          this.$loading();
        }
        const api = this.$inDev ? "https://log.foreverland.xyz" : "";
        const { data } = await this.$http2.get(
          api + "/user/activity/team/action/logs",
          {
            params: {
              fType: this.seleted,
              dType: "DAY_30",
            },
          }
        );
        const list = data.list
          .map((it) => {
            if (!it.memberName && !it.currentUid) {
              it.addr = this.userInfo.username;
            } else {
              it.addr = it.memberName || it.currentUid;
            }
            it.label = it.addr.cutStr(6, 4);
            this.getDesc(it);
            return it;
          })
          .filter((it) => {
            return (
              it.operateAt * 1000 > val &&
              it.operateAt * 1000 <= val + 864 * 1e5
            );
          });
        this.total = list.length;
        this.list = list;
        setTimeout(() => {
          window.jdenticon();
        }, 100);
      } catch (error) {
        console.log(error);
      }
      this.$loading.close();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .ipfs-input {
  width: 130px;
}
</style>