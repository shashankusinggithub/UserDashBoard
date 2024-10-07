import React from "react";
import { MobXProviderContext } from "mobx-react";
import { IRootStore, RootStore } from "../stores/RootStore";

export function useStores(): IRootStore {
  const stores = React.useContext(MobXProviderContext);
  // console.log(mainStore);
  if (!stores.rootStore) {
    throw new Error(
      "Store is not available. Make sure to wrap your component with <Provider>."
    );
  }

  return stores.rootStore as IRootStore;
}
