import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
Config.setTimeoutInMilliseconds(120000);
Config.setDelayRenderTimeoutInMilliseconds(120000);
