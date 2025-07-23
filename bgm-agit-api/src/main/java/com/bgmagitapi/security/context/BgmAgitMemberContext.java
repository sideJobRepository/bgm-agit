package com.bgmagitapi.security.context;

import com.bgmagitapi.entity.BgmAgitMember;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@RequiredArgsConstructor
public class BgmAgitMemberContext implements UserDetails {
    
    private final BgmAgitMember bgmAgitMember;
    private final List<GrantedAuthority> authorities;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }
    
    @Override
    public String getPassword() {
        return "";
    }
    
    @Override
    public String getUsername() {
        return bgmAgitMember.getBgmAgitMemberName();
    }
}
