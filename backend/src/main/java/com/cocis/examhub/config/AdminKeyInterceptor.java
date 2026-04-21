package com.cocis.examhub.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminKeyInterceptor implements HandlerInterceptor {

    private static final String ADMIN_KEY_HEADER = "X-ADMIN-KEY";
    private static final String ADMIN_KEY_ERROR = "Invalid or missing admin key";
    private static final String ADMIN_SECRET_KEY = "John@004";

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
                sendForbiddenResponse(response, "Missing admin key");
                return false;
            }

            if (!ADMIN_SECRET_KEY.equals(providedKey)) {
                sendForbiddenResponse(response, "Invalid admin key");
                return false;
            }
        }

        return true;
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\",\"status\":403}");
    }
}
