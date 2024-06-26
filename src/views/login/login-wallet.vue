<template>
  <div class="wallet-block">
    <div class="wallet-box">
      <div
        class="wallet-item"
        v-for="(item, index) in walletItem"
        :key="item.name"
        v-ripple="{ class: `info--text` }"
        @click="onVerify(item.name)"
      >
        <div class="wallet-item-name">
          <img :src="item.icon" alt="" />
          <span class="name">{{ item.name }}</span>
        </div>
        <div class="d-flex align-center">
          <span class="item-name" :class="{ 'item-name-pop': index == 0 }">{{
            item.btnText
          }}</span>
          <v-btn
            v-if="item.loading"
            disabled
            :loading="walletConnectLoading && loadingName == item.name"
            icon
          ></v-btn>
        </div>
      </div>
    </div>
    <div id="grecaptcha" data-callback="onSubmit" data-size="invisible"></div>
    <div>
      <v-dialog v-model="showQrcode" max-width="450" :retain-focus="false">
        <div class="qrcode-title">
          <v-btn icon class="close-icon" @click="showQrcode = false">
            <v-icon> mdi-close</v-icon>
          </v-btn>
          <span>Scan to use imToken</span>
        </div>
        <div class="qrcode">
          <v-img max-height="300" max-width="300" :src="qrCodeUrl"></v-img>
        </div>
        <div class="text-center">
          <v-btn text plain v-clipboard="qrcodeUri" @success="$toast('Copied!')"
            >Copy to clipboard</v-btn
          >
        </div>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import {
  ExchangeCode,
  ConnectMetaMask,
  SignMetaMask,
  ConnectOkx,
  SignOkx,
  ConnectPhantom,
  SignPhantom,
  ConnectFlow,
  SignFlow,
  ConnectPetra,
  SignPetra,
  ConnectCoinBase,
  SignCoinBase,
  ConnectWalletCon,
  SignWalletCon,
  ConnectBitget,
  SignBitget,
  ConnectImToken,
  SignImToken,
  ConnectImTokenWithMobile,
  SignImTokenWithMobil,
} from "@/utils/login";
import * as fcl from "@onflow/fcl";

export default {
  props: {
    mode: String,
  },
  data() {
    return {
      inviteCode: null,
      sitekey: "6LdPnxclAAAAACTzYeZDztp3dcCKFUIG_5r313JV",
      walletName: "",
      walletConnectLoading: false,
      loadingName: null,
      walletItem: [
        {
          name: "MetaMask",
          icon: require("@/assets/imgs/metamask.png"),
          btnText: "Popular",
        },
        {
          name: "Coinbase Wallet",
          icon: require("@/assets/imgs/coinbase.png"),
          btnText: "",
        },
        {
          name: "WalletConnect",
          icon: require("@/assets/imgs/walletConnect.svg"),
          btnText: "",
          loading: true,
        },
        {
          name: "OKX Wallet",
          icon: require("@/assets/imgs/okx.png"),
          btnText: "",
        },
        {
          name: "Bitget Wallet",
          icon: require("@/assets/imgs/Bitget.svg"),
          btnText: "",
        },
        {
          name: "imToken",
          icon: require("@/assets/imgs/imToken.svg"),
          btnText: "",
          loading: true,
        },
        {
          name: "Phantom",
          icon: require("@/assets/imgs/phantom.png"),
          btnText: "",
        },
        {
          name: "Petra",
          icon: require("@/assets/imgs/petra.svg"),
          btnText: "",
        },

        {
          name: "Flow",
          icon: require("@/assets/imgs/flow.svg"),
          btnText: "",
        },
      ],
      showQrcode: false,
      qrCodeUrl: "",
      qrcodeUri: "",
    };
  },
  mounted() {
    const { inviteCode } = this.$route.query;
    if (inviteCode) {
      this.inviteCode = inviteCode;
    }
  },
  methods: {
    onLoginData(data) {
      console.log(data);
      localStorage.authData = JSON.stringify(data);
      localStorage.token = data.accessToken;
      if (this.mode == "refresh") {
        location.reload();
      } else {
        let loginTo = sessionStorage.loginTo || localStorage.loginTo || "/";
        localStorage.loginTo = "";
        location.href = loginTo;
      }
    },
    async ssoLogin(stoken) {
      this.$loading();
      try {
        const { data } = await this.$http.post(`$auth/st/${stoken}`);
        this.onLoginData(data);
      } catch (error) {
        //
      } finally {
        this.$loading.close();
      }
    },
    connect(name, token) {
      this.capToken = token;
      switch (name) {
        case "MetaMask":
          this.metaMaskConnect();
          break;
        case "OKX Wallet":
          this.okxConnect();
          break;
        case "Phantom":
          this.phantomConnect();
          break;
        case "Flow":
          this.flowConnect();
          break;
        case "Petra":
          this.petraConnect();
          break;
        case "Coinbase Wallet":
          this.coinbaseConnect();
          break;
        case "WalletConnect":
          this.walletConnect();
          break;
        case "Bitget Wallet":
          this.bitgetConnect();
          break;
        case "imToken":
          this.imTokenConnect();
          break;
        default:
          break;
      }
    },
    async metaMaskConnect() {
      const accounts = await ConnectMetaMask();
      if (!accounts) {
        return;
      }
      const nonce = await ExchangeCode(accounts[0]);
      if (!nonce) {
        return;
      }
      const stoken = await SignMetaMask(
        accounts[0],
        nonce,
        this.inviteCode,
        this.capToken
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },
    async okxConnect() {
      const accounts = await ConnectOkx();
      if (!accounts) {
        return;
      }
      const nonce = await ExchangeCode(accounts[0]);
      if (!nonce) {
        return;
      }
      // window.alert(nonce);
      const stoken = await SignOkx(
        accounts[0],
        nonce,
        this.inviteCode,
        this.capToken
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },
    async phantomConnect() {
      const publicKey = await ConnectPhantom();
      if (!publicKey) {
        return;
      }
      const nonce = await ExchangeCode(publicKey);
      if (!nonce) {
        return;
      }
      const stoken = await SignPhantom(
        publicKey,
        nonce,
        this.inviteCode,
        this.capToken
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },
    async flowConnect() {
      fcl.unauthenticate();
      // anywhere on the page
      const currentUser = await ConnectFlow();
      if (!currentUser.addr) {
        return;
      }
      const nonce = await ExchangeCode(currentUser.addr);
      if (!nonce) {
        return;
      }
      const stoken = await SignFlow(
        currentUser.addr,
        nonce,
        this.inviteCode,
        this.capToken
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },
    async petraConnect() {
      const account = await ConnectPetra();
      if (!account) {
        return;
      }
      const nonce = await ExchangeCode(account);
      if (!nonce) {
        return;
      }
      const stoken = await SignPetra(
        account,
        nonce,
        this.inviteCode,
        this.capToken
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },
    async coinbaseConnect() {
      const accounts = await ConnectCoinBase();
      if (!accounts) {
        return;
      }
      const nonce = await ExchangeCode(accounts[0]);
      if (!nonce) {
        return;
      }
      const stoken = await SignCoinBase(
        accounts[0],
        nonce,
        this.inviteCode,
        this.capToken
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },
    async walletConnect() {
      this.walletConnectLoading = true;
      this.loadingName = "WalletConnect";
      window.walletConnectModal.subscribeModal((state) => {
        if (!state.open) {
          this.walletConnectLoading = false;
        }
      });
      const { session, account } = await ConnectWalletCon();
      if (!account) {
        return;
      }
      const nonce = await ExchangeCode(account);
      if (!nonce) {
        return;
      }
      this.walletConnectLoading = false;
      const stoken = await SignWalletCon(
        account,
        nonce,
        this.inviteCode,
        this.capToken,
        session
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },
    async bitgetConnect() {
      const accounts = await ConnectBitget();
      if (!accounts) {
        return;
      }
      const nonce = await ExchangeCode(accounts[0]);
      if (!nonce) {
        return;
      }
      // window.alert(nonce);
      const stoken = await SignBitget(
        accounts[0],
        nonce,
        this.inviteCode,
        this.capToken
      );
      if (stoken) {
        this.ssoLogin(stoken);
      }
    },

    async imTokenConnect() {
      const isImToken = window.ethereum.isImToken;
      if (isImToken) {
        const accounts = await ConnectImTokenWithMobile();
        if (!accounts) {
          return;
        }
        const nonce = await ExchangeCode(accounts[0]);
        if (!nonce) {
          return;
        }
        const stoken = await SignImTokenWithMobil(
          accounts[0],
          nonce,
          this.inviteCode,
          this.capToken
        );
        if (stoken) {
          this.ssoLogin(stoken);
        }
      } else {
        this.walletConnectLoading = true;
        this.loadingName = "imToken";
        const { session, account } = await ConnectImToken(
          this.showImTokenQrcode
        );
        if (!account) {
          return;
        }
        const nonce = await ExchangeCode(account);
        if (!nonce) {
          return;
        }
        const stoken = await SignImToken(
          account,
          nonce,
          this.inviteCode,
          this.capToken,
          session
        );
        if (stoken) {
          this.ssoLogin(stoken);
        }
      }
    },
    showImTokenQrcode(url, uri) {
      this.qrCodeUrl = url;
      this.qrcodeUri = uri;
      this.showQrcode = true;
      this.walletConnectLoading = false;
    },

    onVerify(name) {
      this.$emit("walletVerify", name);
    },
  },
};
</script>

<style lang="scss">
.wallet-block {
  height: 400px;
  position: relative;
  &::after {
    content: "";
    height: 50px;
    position: absolute;
    left: 0px;
    right: 0px;
    z-index: 10;
    pointer-events: none;
    transition: opacity 1s ease-in-out 0s;
    background: linear-gradient(
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.9) 80%
    );
    bottom: 0px;
    opacity: 1;
  }
  .wallet-box {
    height: 100%;
    overflow: hidden auto;
    // padding: 0 30px;
    padding-bottom: 20px;
    .wallet-item {
      width: 100%;
      max-width: 480px;
      height: 56px;
      background: rgba(140, 140, 161, 0.05);
      border-radius: 8px;
      margin: 0 auto;
      margin-top: 12px;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &-name {
        display: flex;
        align-items: center;
      }

      img {
        width: 32px;
        margin-right: 16px;
      }

      .name {
        font-size: 16px;
        font-family: Arial-BoldMT, Arial;
        font-weight: normal;
        color: #495667;
      }

      .item-name {
        display: inline-block;
        color: #735ea1;
        font-size: 10px;
        text-align: center;
        padding: 4px 8px;
      }

      .item-name-pop {
        background: linear-gradient(270deg, #735ea1 0%, #9747ff 100%);
        border-radius: 8px 0px;
        color: #fff;
      }

      .start-btn {
        color: #3eadff;
        border-radius: 6px;
      }

      &:first-child .start-btn {
        color: #fff;
      }
    }
  }
}

.qrcode-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin: 16px 0;
  padding-bottom: 10px;
  position: relative;
  border-bottom: 1px solid rgb(234, 236, 246);
  .close-icon {
    position: absolute;
    left: 8px;
    top: -8px;
  }
}
.qrcode {
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
}
.qrcode::after {
  content: "";
  background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQzLjYgNy40QzQzLjEgNS4zIDQyLjIgNCA0MS4yIDNDNDAuMiAyIDM4LjggMSAzNi44IDAuNUMzNC44IDAgMzAuMiAwIDMwLjIgMEgxMy45QzEzLjkgMCA5LjQgMCA3LjMgMC41QzUuMyAxIDQgMS45IDIuOSAyLjlDMS45IDMuOSAwLjkgNS4zIDAuNSA3LjNDMCA5LjMgMCAxMy45IDAgMTMuOVYzMC4yQzAgMzAuMiAwIDM0LjcgMC41IDM2LjhDMSAzOC45IDEuOSA0MC4yIDIuOSA0MS4zQzMuOSA0Mi4zIDUuMyA0My4yIDcuMyA0My44QzkuMyA0NC4zIDEzLjkgNDQuMyAxMy45IDQ0LjNIMzAuMkMzMC4yIDQ0LjMgMzQuNyA0NC4zIDM2LjggNDMuOEMzOC45IDQzLjMgNDAuMiA0Mi40IDQxLjIgNDEuM0M0Mi4yIDQwLjMgNDMuMiAzOC45IDQzLjYgMzYuOUM0NC4xIDM0LjkgNDQuMSAzMC4zIDQ0LjEgMzAuM1YxNEM0NC4xIDE0IDQ0LjEgOS41IDQzLjYgNy40Wk0yMi4yIDMyLjdDMTUuMiAzMy4zIDguNyAyOS4yIDguMiAyMi44QzcuNyAxNy42IDExLjEgMTUuMyAxMy43IDE1LjFDMTYuNCAxNC45IDE4LjcgMTYuNyAxOC45IDE4LjlDMTkuMSAyMSAxNy43IDIyIDE2LjggMjIuMUMxNiAyMi4yIDE1LjEgMjEuNyAxNSAyMC44QzE0LjkgMjAgMTUuMyAxOS45IDE1LjIgMTlDMTUuMSAxNy41IDEzLjcgMTcuMyAxMi45IDE3LjRDMTIgMTcuNSAxMC4zIDE4LjUgMTAuNiAyMS4xQzEwLjggMjMuNyAxMy40IDI1LjcgMTYuOCAyNS40QzIwLjQgMjUuMSAyMyAyMi40IDIzLjIgMTguNUMyMy4yIDE4LjMgMjMuMyAxOC4xIDIzLjMgMTcuOUMyMy40IDE3LjggMjMuNCAxNy44IDIzLjQgMTcuN0MyMy41IDE3LjUgMjMuNiAxNy40IDIzLjcgMTcuM0wyNCAxN0MyNS42IDE1LjYgMzEuMyAxMi4xIDM2LjcgMTMuMkgzNi44QzM3IDEzLjIgMzcuMSAxMy4zIDM3LjEgMTMuNUMzOC4xIDI2LjEgMjkuNyAzMi4xIDIyLjIgMzIuN1oiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz4KPHBhdGggZD0iTTIyLjIgMzIuNzAwMUMxNS4yIDMzLjMwMDEgOC43IDI5LjIwMDEgOC4yIDIyLjgwMDFDNy43IDE3LjYwMDEgMTEuMSAxNS4zMDAxIDEzLjcgMTUuMTAwMUMxNi40IDE0LjkwMDEgMTguNyAxNi43MDAxIDE4LjkgMTguOTAwMUMxOS4xIDIxLjAwMDEgMTcuNyAyMi4wMDAxIDE2LjggMjIuMTAwMUMxNiAyMi4yMDAxIDE1LjEgMjEuNzAwMSAxNSAyMC44MDAxQzE0LjkgMjAuMDAwMSAxNS4zIDE5LjkwMDEgMTUuMiAxOS4wMDAxQzE1LjEgMTcuNTAwMSAxMy43IDE3LjMwMDEgMTIuOSAxNy40MDAxQzEyIDE3LjUwMDEgMTAuMyAxOC41MDAxIDEwLjYgMjEuMTAwMUMxMC44IDIzLjcwMDEgMTMuNCAyNS43MDAxIDE2LjggMjUuNDAwMUMyMC40IDI1LjEwMDEgMjMgMjIuNDAwMSAyMy4yIDE4LjUwMDFDMjMuMiAxOC4zMDAxIDIzLjMgMTguMTAwMSAyMy4zIDE3LjkwMDFDMjMuNCAxNy44MDAxIDIzLjQgMTcuODAwMSAyMy40IDE3LjcwMDFDMjMuNSAxNy41MDAxIDIzLjYgMTcuNDAwMSAyMy43IDE3LjMwMDFMMjQgMTcuMDAwMUMyNS42IDE1LjYwMDEgMzEuMyAxMi4xMDAxIDM2LjcgMTMuMjAwMUgzNi44QzM3IDEzLjIwMDEgMzcuMSAxMy4zMDAxIDM3LjEgMTMuNTAwMUMzOC4xIDI2LjEwMDEgMjkuNyAzMi4xMDAxIDIyLjIgMzIuNzAwMVoiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSI0Mi44NzA0IiB5MT0iMS40MDM3IiB4Mj0iLTAuMDU2NjkyNyIgeTI9IjQ0LjA0NTIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzExQzREMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDYyQUQiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  width: 45px;
  height: 45px;
  position: absolute;
}

.v-dialog,
.v-dialog--active {
  border-radius: 10px;
}
</style>
