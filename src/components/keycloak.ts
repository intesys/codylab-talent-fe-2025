import type KeycloakType from "keycloak-js";
import { Mode } from "../utils/EnableMode";
let keycloak: KeycloakType | any;

if (import.meta.env.MODE === Mode) {
  const { default: MockKeycloak } = await import("../mocks/MockKeycloak");
  keycloak = MockKeycloak;
} else {
  const Keycloak = (await import("keycloak-js")).default;
  keycloak = new Keycloak({
    url: "http://localhost:9090", 
    realm: "codylab",
    clientId: "cody-login",
  });
}

export default keycloak;
