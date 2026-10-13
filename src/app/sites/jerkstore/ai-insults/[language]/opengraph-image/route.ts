import Image from "../../../_lib/language-social-image";

// Use an explicit public image URL in page metadata. Automatic file-based
// metadata would expose this multisite application's internal /sites path.
export function GET(_request: Request, context: { params: Promise<{ language: string }> }) {
  return Image(context);
}
