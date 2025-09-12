package com.bgmagitapi.page;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Getter
@AllArgsConstructor
public class PageMeta {
    private final long totalElements;
    private final int totalPages;
    private final int number;
    private final int size;
    private final boolean last;
    
    public static PageMeta from(Page<?> p) {
        return new PageMeta(p.getTotalElements(), p.getTotalPages(),
                p.getNumber(), p.getSize(), p.isLast());
    }
}
