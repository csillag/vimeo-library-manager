import { ApiHandler } from "./ApiHandler";
import { Api as VimeoLibraryManager, ManagerConfig } from "./Api";
export { Api as VimeoLibraryManager } from "./Api";
export { mergeInto } from "./util";

export function createVimeoLibraryManager(
  config: ManagerConfig
): VimeoLibraryManager {
  return new ApiHandler(config);
}
