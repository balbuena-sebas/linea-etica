// @ts-ignore: Deno std lib
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve((req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/ping" || url.pathname === "/api/health") {
    return new Response(JSON.stringify({
      status: "OK",
      message: "Servidor funcionando",
      timestamp: new Date().toISOString()
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  }

  return new Response(JSON.stringify({
    error: "Ruta no encontrada",
    availableRoutes: ["/ping", "/api/health"]
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
});

