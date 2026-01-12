import {atom} from "recoil";
import type {CurriculumData} from "../../types/curriculum.ts";
import type {AcademyClass} from "../../types/academy.ts";

export const curriculumDataState = atom<CurriculumData | null>({
    key: 'curriculumDataState',
    default: null,
});

export const academyClassDataState = atom<AcademyClass[] | []>({
    key: 'academyClassDataState',
    default: [],
});