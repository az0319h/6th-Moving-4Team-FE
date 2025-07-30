import {
   ClientProfilePostValue,
   ClientProfileUpdateValue,
} from "@/lib/schemas";
import { tokenFetch, tokenSettings } from "@/lib/utils";

const clientProfile = {
   post: async (data: ClientProfilePostValue) => {
      const res = await tokenFetch("/profile/clients", {
         method: "PATCH",
         body: JSON.stringify(data),
      });

      tokenSettings.set(res.data.accessToken);

      return res;
   },

   update: async (data: ClientProfileUpdateValue) => {
      const res = await tokenFetch("/profile/clients", {
         method: "PATCH",
         body: JSON.stringify(data),
      });

      tokenSettings.set(res.data.accessToken);

      return res;
   },
};

export default clientProfile;
