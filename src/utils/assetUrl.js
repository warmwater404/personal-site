/** 把 "./me.jpg" 这类相对路径拼上打包基准路径，保证部署到子目录也能显示 */
export function resolveAsset(path) {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, "")}`;
}
