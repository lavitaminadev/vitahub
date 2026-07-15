import { Injectable } from "@nestjs/common";

export type OAuthProvider = "meta" | "instagram" | "google_calendar" | "gmail" | "google_drive" | "google_business";

export interface OAuthState {
  company_id: string;
  provider: string;
  redirect_uri: string;
}

@Injectable()
export class OAuthService {
  buildState(companyId: string, provider: OAuthProvider): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const state: OAuthState = {
      company_id: companyId,
      provider,
      redirect_uri: `${appUrl}/api/auth/callback`,
    };
    return Buffer.from(JSON.stringify(state)).toString("base64");
  }

  decodeState(state: string): OAuthState | null {
    try {
      return JSON.parse(Buffer.from(state, "base64").toString("utf8")) as OAuthState;
    } catch {
      return null;
    }
  }

  buildUrl(companyId: string, provider: OAuthProvider): string | null {
    const state = this.buildState(companyId, provider);
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`;

    switch (provider) {
      case "meta":
      case "instagram": {
        const appId = process.env.META_APP_ID;
        if (!appId) return null;
        const version = process.env.META_GRAPH_API_VERSION || "v23.0";
        const params = new URLSearchParams({
          client_id: appId,
          redirect_uri: callbackUrl,
          state,
          scope: "pages_show_list,instagram_basic,instagram_manage_messages,pages_messaging",
          response_type: "code",
        });
        return `https://www.facebook.com/${version}/dialog/oauth?${params}`;
      }
      case "google_calendar": {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) return null;
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: callbackUrl,
          state,
          scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
          response_type: "code",
          access_type: "offline",
          prompt: "consent",
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      }
      case "gmail": {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) return null;
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: callbackUrl,
          state,
          scope: "https://www.googleapis.com/auth/gmail.send",
          response_type: "code",
          access_type: "offline",
          prompt: "consent",
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      }
      case "google_drive": {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) return null;
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: callbackUrl,
          state,
          scope: "https://www.googleapis.com/auth/drive.readonly",
          response_type: "code",
          access_type: "offline",
          prompt: "consent",
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      }
      case "google_business": {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) return null;
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: callbackUrl,
          state,
          scope: "https://www.googleapis.com/auth/business.manage",
          response_type: "code",
          access_type: "offline",
          prompt: "consent",
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      }
      default:
        return null;
    }
  }

  async handleCallback(code: string, state: string, provider: OAuthProvider) {
    const stateData = this.decodeState(state);
    if (!stateData) return { redirectUrl: "/dashboard/integraciones?error=invalid_state" };
    if (stateData.provider !== provider) return { redirectUrl: "/dashboard/integraciones?error=provider_mismatch" };
    return {
      redirectUrl: `/dashboard/integraciones?connecting=${provider}&company=${stateData.company_id}`,
    };
  }
}
