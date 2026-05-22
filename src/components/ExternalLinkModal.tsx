import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { playClickSfx } from "@/hooks/use-sfx";
import { useCallback, useMemo } from "react";

interface ExternalLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

// Helper to convert standard links to embeddable versions
function getEmbedUrl(rawUrl: string): string {
  try {
    let processedUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }

    const urlObj = new URL(processedUrl);
    const hostname = urlObj.hostname.toLowerCase();

    // YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      // If it's already an embed link, return as is
      if (urlObj.pathname.includes("/embed/")) return processedUrl;
      
      let videoId = "";
      if (hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1).split("?")[0];
      } else if (urlObj.pathname.includes("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1];
      } else if (urlObj.searchParams.has("v")) {
        videoId = urlObj.searchParams.get("v")!;
      }

      if (videoId) {
        let embed = `https://www.youtube.com/embed/${videoId}`;
        if (urlObj.searchParams.has("list")) {
          embed += `?list=${urlObj.searchParams.get("list")}`;
        }
        return embed;
      } else if (urlObj.searchParams.has("list")) {
        return `https://www.youtube.com/embed/videoseries?list=${urlObj.searchParams.get("list")}`;
      }
    }

    // Google Drive
    if (hostname.includes("drive.google.com") && urlObj.pathname.includes("/view")) {
      return processedUrl.replace("/view", "/preview");
    }

    // SharePoint / OneDrive
    if (hostname.includes("sharepoint.com") || hostname.includes("onedrive.live.com")) {
      if (!urlObj.searchParams.has("action")) {
        urlObj.searchParams.set("action", "embedview");
        return urlObj.toString();
      }
    }

    return processedUrl;
  } catch {
    return rawUrl;
  }
}

const ExternalLinkModal = ({
  open,
  onOpenChange,
  url,
  title,
}: ExternalLinkModalProps) => {
  const { t } = useI18n();

  // Use transformed URL for the iframe, but keep original for the "Open in new tab" button
  const embedUrl = useMemo(() => getEmbedUrl(url), [url]);

  const handleOpenExternal = useCallback(() => {
    playClickSfx();
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-[95vw] h-[90vh] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-start justify-between gap-3 pe-8 mb-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base font-display">
                {title}
              </DialogTitle>
              <DialogDescription className="truncate text-xs mt-0.5 text-left" dir="ltr">
                {url}
              </DialogDescription>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleOpenExternal}
              className="gap-1.5 text-xs shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t("externalLink.openInNewTab")}
              </span>
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
            <Info className="w-4 h-4 shrink-0 text-primary" />
            <p className="leading-relaxed">{t("externalLink.blockedHint")}</p>
          </div>
        </DialogHeader>

        <div className="flex-1 relative min-h-0 bg-white">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            style={{ minHeight: 0 }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="autoplay; encrypted-media; fullscreen"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalLinkModal;
