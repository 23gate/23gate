<template>
  <div id="authapp" />
</template>

<script setup>
import React from "react";
import ReactDOM from "react-dom";
import { onMounted } from "vue";

import SuperTokens from "supertokens-auth-react";
import { SuperTokensReactConfig } from "@/supertokens";

SuperTokens.init(SuperTokensReactConfig);

function SupertokenComponent() {
  if (SuperTokens.canHandleRoute()) {
    return SuperTokens.getRoutingComponent();
  }
  return "Route not found";
}

onMounted(() => {
  ReactDOM.render(
    React.createElement(SupertokenComponent),
    document.getElementById("authapp")
  );
});
</script>