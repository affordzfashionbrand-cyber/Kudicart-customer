import { Linking } from 'react-native';

export type DeepLinkActionType =
  | 'CATEGORY'
  | 'PRODUCT'
  | 'BRAND'
  | 'SEARCH_QUERY'
  | 'EXTERNAL_URL'
  | 'NONE';

export interface CatalogNavigationActions {
  setQuery?: (q: string) => void;
  setCategory?: (c: string) => void;
  setGender?: (g: any) => void;
  setTab?: (tab: string) => void;
}

export interface NavigationRouter {
  push: (href: any) => void;
  replace?: (href: any) => void;
  back?: () => void;
  [key: string]: any;
}

export function handleActionPress(
  actionType: DeepLinkActionType | string | undefined,
  actionValue: string | undefined | null,
  router: NavigationRouter,
  catalogActions?: CatalogNavigationActions,
) {
  if (!actionType || actionType === 'NONE') return;

  const normalizedType = actionType.toUpperCase() as DeepLinkActionType;

  switch (normalizedType) {
    case 'PRODUCT': {
      if (actionValue) {
        router.push(`/product/${encodeURIComponent(actionValue)}` as any);
      }
      break;
    }

    case 'CATEGORY': {
      if (actionValue) {
        if (catalogActions?.setCategory) {
          catalogActions.setCategory(actionValue);
        }
        router.push(`/category/${encodeURIComponent(actionValue)}` as any);
      }
      break;
    }

    case 'SEARCH_QUERY': {
      if (actionValue) {
        if (catalogActions?.setQuery) {
          catalogActions.setQuery(actionValue);
        }
        if (catalogActions?.setTab) {
          catalogActions.setTab('SHOP');
        }
      }
      break;
    }

    case 'BRAND': {
      if (actionValue) {
        if (catalogActions?.setQuery) {
          catalogActions.setQuery(actionValue);
        }
        if (catalogActions?.setTab) {
          catalogActions.setTab('SHOP');
        }
      }
      break;
    }

    case 'EXTERNAL_URL': {
      if (actionValue) {
        Linking.canOpenURL(actionValue)
          .then((supported) => {
            if (supported) {
              Linking.openURL(actionValue);
            }
          })
          .catch((err) => {
            console.warn('Failed to open external URL:', err);
          });
      }
      break;
    }

    default:
      break;
  }
}
