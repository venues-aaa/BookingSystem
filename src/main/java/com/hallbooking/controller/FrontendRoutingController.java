package com.hallbooking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Frontend Routing Controller for Single Page Application (SPA).
 * This controller handles routing for client-side paths by forwarding to
 * index.html.
 * It ensures that all frontend routes work correctly when the page is refreshed
 * or accessed directly.
 */
@Controller
public class FrontendRoutingController {

    /**
     * Catch-all mapping for frontend routes not handled by backend API.
     * Forwards all non-API requests to index.html for React Router to handle.
     * 
     * This ensures that routes like /booking, /admin, /vendor, etc., are properly
     * handled by React
     * instead of returning a 404 error from Spring Boot.
     */
    // @GetMapping("/{path:^(?!api)[a-zA-Z0-9/_.-]*}/**")
    public String forwardFrontendRequests(@PathVariable String path) {
        // Forward to index.html - React Router will handle the routing
        return "forward:/index.html";
    }

    /**
     * Catch-all for root paths without the {path} variable.
     * Handles simple paths like /admin, /vendor, /booking, etc.
     */
    // @GetMapping({ "/{path:^(?!api)[a-zA-Z0-9/_.-]*}" })
    public String forwardSinglePathSegment(@PathVariable String path) {
        // Forward to index.html - React Router will handle the routing
        return "forward:/index.html";
    }
}
