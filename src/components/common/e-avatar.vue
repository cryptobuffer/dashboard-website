<template>
  <div ref="content" class="avatar-content al-c"></div>
</template>

<script>
import jazzicon from "jazzicon";

export default {
  props: {
    address: String,
    diameter: {
      default: 24,
      type: Number,
    },
  },
  data() {
    return {
      iconDom: null,
    };
  },
  mounted() {
    this.generateIdentIconDom();
    this.$refs.content.appendChild(this.iconDom);
  },
  computed: {
    jsNumberForAddress() {
      if (this.address) {
        const addr = this.address.slice(2, 10);
        const seed = parseInt(addr, 16);
        return seed;
      }

      return "";
    },
  },
  methods: {
    generateIdentIconDom() {
      const identicon = jazzicon(this.diameter, this.jsNumberForAddress);
      this.iconDom = identicon.cloneNode(true);
    },
  },
  watch: {
    address() {
      this.$refs.content.removeChild(this.iconDom);
      this.generateIdentIconDom();
      this.$refs.content.appendChild(this.iconDom);
    },
  },
};
</script>

<style lang="scss" scoped>
.avatar-content {
  text-indent: 0;
}
</style>
