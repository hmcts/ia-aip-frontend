import { Router } from 'express';
import { DocumentManagementService } from '../service/document-management-service';
import UpdateAppealService from '../service/update-appeal-service';

interface PageSetup {
  initialise(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService?: DocumentManagementService): Router;
}

export namespace PageSetup {
  type Constructor<T> = {
    new (...args: any[]): T;
    readonly prototype: T;
  };

  const implementations: Constructor<PageSetup>[] = [];
  export function GetImplementations(): Constructor<PageSetup>[] {
    return implementations;
  }
  export function register<T extends Constructor<PageSetup>>(
    ctor: T
  ): Constructor<PageSetup> {
    implementations.push(ctor);
    return ctor;
  }
}
