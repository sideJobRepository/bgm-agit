import {atom} from "recoil";
import type {CurriculumData} from "../../types/curriculum.ts";

export const curriculumDataState = atom<CurriculumData | null>({
    key: 'curriculumDataState',
    default: null,
});