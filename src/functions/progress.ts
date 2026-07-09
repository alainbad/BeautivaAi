import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/server/lib/auth";
import { AppError, toApiResponse } from "@/server/lib/response";
import { uploadDataUrlImage } from "@/server/lib/storage";

export const listProgressPhotos = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("progress_photos")
      .select()
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

/** progressService.addProgressPhoto */
export const addProgressPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ dataUrl: z.string().min(1), notes: z.string().optional() }))
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();

      const [upload, { data: latestAnalysis }] = await Promise.all([
        uploadDataUrlImage(supabase, {
          bucket: "progress-photos",
          userId: user.id,
          dataUrl: data.dataUrl,
        }),
        supabase
          .from("skin_analyses")
          .select("skin_score")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const { data: photo, error } = await supabase
        .from("progress_photos")
        .insert({
          user_id: user.id,
          image_url: upload.path,
          notes: data.notes,
          skin_score: latestAnalysis?.skin_score ?? null,
        })
        .select()
        .single();
      if (error) throw new AppError(error.message, 500);
      return { ...photo, imageUrl: upload.publicUrl };
    }),
  );
