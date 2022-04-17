import { useRef, useMemo, useCallback } from 'react';
import { OverlayTriggerProps } from '@react-types/overlays';
import { useOverlayPosition, useOverlayTrigger } from '@react-aria/overlays';
import { useOverlayTriggerState } from '@react-stately/overlays';
import { useButton } from '@react-aria/button';
import { mergeRefs } from '../utils/refs';
import { PopoverPlacement, getAriaPlacement } from './utils';

export interface UsePopoverProps extends OverlayTriggerProps {
  placement?: PopoverPlacement;
  shouldFlip?: boolean;
  offset?: number;
  /** Handler that is called when the overlay should close. */
  onClose?: () => void;
  /**
   * Whether to close the overlay when the user interacts outside it.
   * @default false
   */
  isDismissable?: boolean;
  /**
   * Whether the popover is animated.
   */
  disableAnimation?: boolean;
  /** Whether the overlay should close when focus is lost or moves outside it. */
  shouldCloseOnBlur?: boolean;
  /**
   * Whether pressing the escape key to close the overlay should be disabled.
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * When user interacts with the argument element outside of the overlay ref,
   * return true if onClose should be called.  This gives you a chance to filter
   * out interaction with elements that should not dismiss the overlay.
   * By default, onClose will always be called on interaction outside the overlay ref.
   */
  shouldCloseOnInteractOutside?: (element: HTMLElement) => boolean;
}

/**
 * @internal
 */
export function usePopover(props: UsePopoverProps = {}) {
  const {
    isOpen,
    defaultOpen,
    onOpenChange,
    shouldFlip = true,
    offset = 12,
    placement = 'bottom',
    onClose,
    shouldCloseOnBlur = true,
    isDismissable = true,
    isKeyboardDismissDisabled = true,
    disableAnimation = false
  } = props;

  const triggerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLElement>(null);

  const state = useOverlayTriggerState({
    isOpen,
    defaultOpen,
    onOpenChange
  });

  const getState = useMemo(() => {
    if (state.isOpen) return 'open';
    return 'closed';
  }, [state.isOpen]);

  const handleClose = useCallback(() => {
    onClose?.();
    state.close();
  }, [state, onClose]);

  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    state,
    triggerRef
  );

  const { overlayProps: positionProps } = useOverlayPosition({
    isOpen: state.isOpen,
    targetRef: triggerRef,
    placement: getAriaPlacement(placement),
    overlayRef,
    shouldFlip,
    offset
  });

  const { buttonProps: buttonTriggerProps } = useButton(
    {
      onPress: () => state.open()
    },
    triggerRef
  );

  const getTriggerProps = useCallback(
    (props = {}, _ref = null) => {
      return {
        ...props,
        ...buttonTriggerProps,
        ...triggerProps,
        ref: mergeRefs(triggerRef, _ref)
      };
    },
    [triggerRef, triggerProps, buttonTriggerProps]
  );

  const getPopoverProps = useCallback(
    (props = {}) => {
      return {
        ...props,
        ...overlayProps,
        ...positionProps,
        'data-state': getState,
        'data-placement': placement
      };
    },
    [getState, positionProps, overlayProps, placement]
  );

  return {
    state,
    overlayRef,
    placement,
    disableAnimation,
    shouldCloseOnBlur,
    isDismissable,
    isKeyboardDismissDisabled,
    isOpen: state.isOpen,
    onClose: handleClose,
    triggerProps,
    overlayProps,
    positionProps,
    getTriggerProps,
    getPopoverProps
  };
}

export type UsePopoverReturn = ReturnType<typeof usePopover>;