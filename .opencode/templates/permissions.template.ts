import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const {{ENTITY}}_PERMISSIONS = {
  view: '{{module}}.{{resource}}.view',
  create: '{{module}}.{{resource}}.create',
  update: '{{module}}.{{resource}}.update',
  delete: '{{module}}.{{resource}}.delete',
} as const;
