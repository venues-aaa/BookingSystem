package com.hallbooking.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Custom Error Controller to redirect all error pages to home page.
 * This ensures that 404, 500, and other HTTP error pages are redirected to the home page.
 */
@Controller
public class CustomErrorController implements ErrorController {

    /**
     * Handle error requests and redirect to home page (/).
     * This method will be triggered for any error status codes like 404, 500, etc.
     */
    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        // Get the error status code
        Object status = request.getAttribute("javax.servlet.error.status_code");
        
        // Log the error for debugging
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            System.out.println("Error with status code: " + statusCode);
        }
        
        // Redirect to home page for all errors
        return "redirect:/";
    }
}
