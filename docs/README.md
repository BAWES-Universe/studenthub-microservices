---
title: Documentation Overview
description: An overview of the new documentation structure, including the starter kit, API reference, and development guidelines.
---

# Documentation Overview

Welcome to the Mintlify documentation. This document provides an overview of our documentation structure, designed to help you get started with our tools and services quickly and efficiently. Our documentation is divided into several key sections, each tailored to different aspects of our offerings.

## Introduction

The introduction section provides a high-level overview of Mintlify, including the philosophy behind our tools, the problems we aim to solve, and the benefits of using our solutions. This section is a great starting point for new users to understand what Mintlify is all about.

## Quickstart Guide

Our Quickstart Guide is designed to help you hit the ground running with the Mintlify starter kit. It includes step-by-step instructions on how to:

- Use the `Use this template` feature to copy the Mintlify starter kit.
- Navigate through the included examples, such as guide pages, navigation, customizations, and API reference pages.
- Utilize popular components within your documentation.

```typescript
// Example command to install the Mintlify CLI
npm i -g mintlify
```

```typescript
// Command to run Mintlify in development mode
mintlify dev
```

## Development Guidelines

The Development section is dedicated to providing detailed guidelines for working with the Mintlify documentation. It covers:

- Installation and usage of the Mintlify CLI for previewing changes locally.
- Best practices for writing and structuring your documentation.
- Tips for customizing the look and feel of your documentation to match your branding.

## API Reference

Our API Reference section is an exhaustive resource for developers looking to integrate with Mintlify's APIs. It includes:

- Function signatures, parameter descriptions, and return types for each API endpoint.
- Usage examples to help you understand how to implement our APIs in your projects.

## Environment Configurations

This section provides detailed instructions on configuring your environment to work with Mintlify, including:

- Setting up proxy configurations for different services.
- Troubleshooting common issues related to development and deployment.

### Troubleshooting

- If `mintlify dev` isn't running, try running `mintlify install` to re-install dependencies.
- If a page loads as a 404, ensure you are running the command in a folder containing `docs.json`.

### Publishing Changes

To publish changes to your documentation, install our GitHub App to automatically propagate changes from your repository to your deployment. Changes will be deployed to production automatically after pushing to the default branch. You can find the link to install the app on your dashboard.

This overview is designed to provide a comprehensive guide to our documentation structure. For more detailed information, please refer to the specific sections mentioned above.