package com.hallbooking.security;

import com.hallbooking.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Load user from MongoDB by email
        Query query = Query.query(Criteria.where("emailId").is(username));
        User user = mongoTemplate.findOne(query, User.class);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        // Get role from user details
        String role = user.getDetails() != null && user.getDetails().getRole() != null
            ? user.getDetails().getRole()
            : "USER";

        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getEmailId())
                .password(user.getPassword())  // BCrypt hashed password from MongoDB
                .authorities(authorities)
                .accountLocked(!user.getIsActive())
                .build();
    }
}
