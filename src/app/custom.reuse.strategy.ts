/**
 * The custom route reuse strategy inherits the "RouteReuseStrategy" to achieve a very usual case,
 * which by default, Angular doesn't support.
 * 1. Search for items based on filter conditions.
 * 2. Navigate to one of the item to the detail page(component).
 * 3. Navigate back to searched item list without re-initializing the search&list component again.
 * This requires the Angular route to save the search&list component, and restore it whenever back.
 * The detail solution is described in following thread:
 * https://stackoverflow.com/questions/41280471/how-to-implement-routereusestrategy-shoulddetach-for-specific-routes-in-angular
 */
import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  routesToCache: string[] = ['list'];
  storedRouteHandles = new Map<string, DetachedRouteHandle>();

  /**
   * When navigation from a reusable component, and if shouldReuseRoute return false,
   * this method is invoked to decide whether the current route should be stored.
   * @param route
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.routesToCache.indexOf(route.routeConfig.path) > -1;
  }

  /**
   * If the current route need to be stored, that is shouldDetach return true,
   * then on this method, you can implement a way to store routes. Usually in a Map.
   * @param route
   * @param handle
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.storedRouteHandles.set(route.routeConfig.path, handle);
  }

  /**
   * When navigation to a reusable component, and if shouldReuseRoute return false,
   * this method is invoked to decide whether the target component can be get from a reuse buffer.
   * @param route
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRouteHandles.has(route.routeConfig.path);
  }

  /**
   * If shouldAttach return true, then this method is invoke to retrieve the component from the buffer.
   * @param route
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.storedRouteHandles.get(route.routeConfig.path);
  }

  /**
   * By default, Angular doesn't re-initializing the same component if the navigation is not to
   * a different one. For example, you switch different entity ID in the same entity type detail page.
   * In this way, shouldReuseRoute should return true to avoid executing other methods in this Class.
   * However, if you navigate from search&list component to entity detail component, then the method should return false.
   * So that other methods can be executed to decide whether the search&list component should be stored for future reuse.
   * @param future
   * @param curr
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
