
import { FormGroupInput, Card, DropDown, Button } from "../components/index";

const GlobalComponents = {
  install(app) {
    app.component("fg-input", FormGroupInput);
    app.component("drop-down", DropDown);
    app.component("card", Card);
    app.component("p-button", Button);
  },
};

export default GlobalComponents;

