package com.hallbooking.security;

import com.hallbooking.model.User;
//import com.hallbooking.dao.impl.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    //@Autowired
   // private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = new User();/* userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));*/
        user.setEmailId("admin@admin.com");
        user.setPassword("admin");
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + /*user.getRole().name()*/"ADMIN")
        );

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getEmailId())
                .password(user.getPassword())
                .authorities(authorities)
                .build();
    }
}
