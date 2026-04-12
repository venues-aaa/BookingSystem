package com.hallbooking.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI hallBookingOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hall Booking System API")
                        .description("REST API for Hall Booking Management System with MongoDB")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Hall Booking System")
                                .email("support@hallbooking.com")));
    }
}