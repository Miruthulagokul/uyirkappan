import { ApplicationInsights } from "@microsoft/applicationinsights-web";

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,

    enableAutoRouteTracking: true,

    autoTrackPageVisitTime: true,

    enableCorsCorrelation: true,

    disableFetchTracking: false,

    disableAjaxTracking: false
  }
});

appInsights.loadAppInsights();

export default appInsights;