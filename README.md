# MSW Toolbar

A simple utility to make your MSW experience a little bit better.

### Requirements

- [msw](https://github.com/mswjs/msw)

### Usage

There are two primary ways to use this component:

1. As a wrapper around your entire app

   1. When you structure things like the below, you guarantee that _all requests_ will be intercepted because `children` will not be rendered until the worker has successfully started.

   ```jsx
   <MSWToolbar {...props}>
     <YourApp />
   </MSWToolbar>
   ```

2. As a regular component in the tree
   1. When you do this, all requests _should be intercepted_, but it's not guaranteed because there can be timing issues with the service worker registration.
   ```jsx
   <YourApp>
     <MSWToolbar {...props} />
     <Header />
     <Content />
     <Footer />
   </YourApp>
   ```
