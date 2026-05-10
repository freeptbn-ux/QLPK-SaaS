/**
 * Returns a safe, generic error message for a given error.
 * Masking sensitive details like SQL errors or stack traces.
 */
export function getGenericErrorMessage(error: unknown): string {
  // Log the real error to server console for debugging
  console.error("Server Side Error:", error instanceof Error ? error : JSON.stringify(error, null, 2));

  // Default message
  let message = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";

  // If it's a known error type, we can customize slightly without leaking info
  if (error instanceof Error) {
    const errMessage = error.message.toLowerCase();
    
    // Check for common patterns but don't leak SQL
    if (errMessage.includes("violates foreign key constraint")) {
      message = "Không thể thực hiện tác vụ này vì dữ liệu đang được sử dụng ở nơi khác.";
    } else if (errMessage.includes("unique constraint")) {
      message = "Dữ liệu này đã tồn tại trong hệ thống.";
    } else if (errMessage.includes("unauthorized") || errMessage.includes("permission denied")) {
      message = "Bạn không có quyền thực hiện tác vụ này.";
    } else if (errMessage.includes("not found")) {
      message = "Không tìm thấy dữ liệu yêu cầu.";
    } else if (errMessage.includes("insufficient stock")) {
      message = "Số lượng tồn kho không đủ để thực hiện thao tác này.";
    }
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    const errMessage = String((error as { message: unknown }).message).toLowerCase();
    
    if (errMessage.includes("violates foreign key constraint")) {
      message = "Không thể thực hiện tác vụ này vì dữ liệu đang được sử dụng ở nơi khác.";
    } else if (errMessage.includes("unique constraint")) {
      message = "Dữ liệu này đã tồn tại trong hệ thống.";
    } else if (errMessage.includes("unauthorized") || errMessage.includes("permission denied")) {
      message = "Bạn không có quyền thực hiện tác vụ này.";
    } else if (errMessage.includes("not found")) {
      message = "Không tìm thấy dữ liệu yêu cầu.";
    } else if (errMessage.includes("insufficient stock")) {
      message = "Số lượng tồn kho không đủ để thực hiện thao tác này.";
    }
  }

  return message;
}

/**
 * Utility to handle and format server-side errors before sending to client.
 */
export function handleServerError(error: unknown): { success: false; error: string } {
  return {
    success: false,
    error: getGenericErrorMessage(error),
  };
}

/**
 * Higher-order function to wrap server actions with error handling.
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    return handleServerError(error);
  }
}
