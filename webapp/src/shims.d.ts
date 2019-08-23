declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '*.png' {
  const url: string;
  export default url;
}
