import { useMutation } from "@tanstack/react-query";
import {
  completeAdminImageUpload,
  requestAdminImageUploadUrl,
} from "./generated/api";
import type {
  AdminImageUploadCompletion,
  AdminImageUploadRequest,
} from "./generated/api.schemas";

export type AdminImageUploadVariables = {
  data: {
    file: File;
    purpose: AdminImageUploadRequest["purpose"];
  };
};

export function useUploadAdminImage() {
  return useMutation({
    mutationFn: async ({ data }: AdminImageUploadVariables) => {
      const reservation = await requestAdminImageUploadUrl({
        fileName: data.file.name,
        size: data.file.size,
        contentType: data.file.type as AdminImageUploadRequest["contentType"],
        purpose: data.purpose,
      });

      const uploadResponse = await fetch(reservation.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": data.file.type },
        body: data.file,
      });
      if (!uploadResponse.ok) {
        throw new Error("The image could not be transferred to storage.");
      }

      const completion: AdminImageUploadCompletion = {
        objectPath: reservation.objectPath,
        purpose: data.purpose,
      };
      return completeAdminImageUpload(completion);
    },
  });
}