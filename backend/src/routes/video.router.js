import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import {
  deleteVideo,
  getVideoById,
  publishVideo,
  togglePublish,
  updateVideo,
} from "../controllers/video.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router
  .route("/")
  .get("getAllVideos")
  .post(
    verifyJwt,
    upload.fields[
      ({
        name: "thumbnail",
        maxCount: 1,
      },
      {
        name: "videoFile",
        maxCount: 1,
      })
    ],
    publishVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(verifyJwt, upload.single("thumbnail"), updateVideo)
  .delete(verifyJwt, deleteVideo);

router.route("/toggle-publish/:videoId").patch(verifyJwt, togglePublish);

export default router;
