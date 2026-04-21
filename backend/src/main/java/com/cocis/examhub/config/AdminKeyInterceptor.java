package com.cocis.examhub.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

@Component
public class AdminKeyInterceptor implements HandlerInterceptor {

    private static final String ADMIN_KEY_HEADER = "X-ADMIN-KEY";
    private static final String ADMIN_KEY_ERROR = "Invalid or missing admin key";
    private static final String ADMIN_SECRET_KEY = "John@004";
    private static final List<String> ALLOWED_ORIGINS = List.of("http://localhost:5173", "http://localhost:3000");

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestPath = request.getRequestURI();
        String httpMethod = request.getMethod();

        // Allow CORS preflight requests to pass through
        if ("OPTIONS".equalsIgnoreCase(httpMethod)) {
            return true;
        }

        // Only protect admin-related endpoints
        if (requestPath.startsWith("/api/admin") || requestPath.contains("-admin")) {
            String providedKey = request.getHeader(ADMIN_KEY_HEADER);

            if (providedKey == null || providedKey.isEmpty()) {
                sendForbiddenResponse(response, "Missing admin key", request);
                return false;
            }

            if (!ADMIN_SECRET_KEY.equals(providedKey)) {
                sendForbiddenResponse(response, "Invalid admin key", request);
                return false;
            }
        }

        return true;
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message, HttpServletRequest request) throws Exception {
        // Add CORS headers to allow the browser to read the response
        String origin = request.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else if (!ALLOWED_ORIGINS.isEmpty()) {
            response.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.get(0));
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "X-ADMIN-KEY, Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\",\"status\":403}");
    }
}
