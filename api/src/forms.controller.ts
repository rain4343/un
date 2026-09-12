import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import {
  FORM_TITLES,
  FORM_2_FIELDS,
  itemsBySection,
} from "../../src/content/frameworks";
import { FORM_CODES, type FormCode } from "../../src/content/frameworks/types";
import { RequirePermissions } from "./auth/roles.decorator";

@Controller("forms")
export class FormsController {
  @Get()
  @RequirePermissions("sites.read.assigned")
  catalog() {
    return {
      forms: FORM_CODES.map((code) => ({
        code,
        title: FORM_TITLES[code],
      })),
      sections: itemsBySection().map(({ section, title, items }) => ({
        id: section,
        title,
        itemCount: items.length,
      })),
    };
  }

  @Get(":code")
  @RequirePermissions("sites.read.assigned")
  definition(@Param("code") code: string) {
    if (code !== "FORM_1" && code !== "FORM_2") {
      throw new NotFoundException();
    }
    const form = code as FormCode;
    return {
      code: form,
      title: FORM_TITLES[form],
      version: "1.0.0",
      sections:
        form === "FORM_1"
          ? itemsBySection()
          : itemsBySection().map(({ section, title }) => ({
              section,
              title,
              fields: FORM_2_FIELDS,
            })),
    };
  }
}
