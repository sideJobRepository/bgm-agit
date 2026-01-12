package com.bgmagitapi.academy.repository.query;

import com.bgmagitapi.academy.entity.Inputs;

public interface ProgressInputsQueryRepository {

    void deleteByInputs(Inputs findInputs);
}
