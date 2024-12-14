import axios from "axios";

const ADDRESS = "https://penpot-copilot-backend.onrender.com";
export const FE_ADDRESS = "https://penpot-copilot.vercel.app";

type TOG_Response = {
  success: boolean;
  og_response: string | null;
  error: string | null;
};
export async function ogResponseServer(
  userId: string,
  prompt: string,
): Promise<TOG_Response> {
  try {
    const response = await axios.post(`${ADDRESS}/og_response`, {
      userId,
      prompt,
    });
    if (response.status == 505 || response.status == 200) {
      const responseData = response.data as TOG_Response;
      return responseData;
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const response: TOG_Response = {
      success: false,
      og_response: null,
      error: catchError.message,
    };
    return response;
  }
}

type TCreateHTMLResponse = {
  success: boolean;
  html: string | null;
  css?: string | null;
  error: string | null;
};
export async function createHTMLServer(
  userId: string,
  prompt: string,
): Promise<TCreateHTMLResponse> {
  try {
    const response = await axios.post(`${ADDRESS}/create_html`, {
      userId,
      prompt,
    });
    if (response.status == 200) {
      const responseData = response.data as TCreateHTMLResponse;
      return responseData;
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const response: TCreateHTMLResponse = {
      success: false,
      html: null,
      error: catchError.message,
    };
    return response;
  }
}

type TGetUserTrials = {
  trials: number | null;
  error?: string | null;
};
export async function getUserTrialsServer(
  userId: string,
): Promise<TGetUserTrials> {
  try {
    const response = await axios.post(`${ADDRESS}/get_user_trials`, {
      userId,
    });
    if (response.status == 200) {
      const responseData = response.data as TGetUserTrials;
      return responseData;
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const errorResponse: TGetUserTrials = {
      trials: null,
      error: catchError.message,
    };
    return errorResponse;
  }
}

export type TPollBucket = {
  success: boolean;
  pollResult: boolean;
  bucketId: string | null;
  penpotTree: string | null;
  error: string | null;
};
export async function pollBucketServer(bucketId: string): Promise<TPollBucket> {
  try {
    const response = await axios.post(`${ADDRESS}/poll_bucket`, {
      bucketId,
    });
    if (response.status == 200) {
      const responseData = response.data as TPollBucket;
      return responseData;
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const errorResponse: TPollBucket = {
      success: false,
      pollResult: false,
      bucketId: null,
      penpotTree: null,
      error: catchError.message,
    };
    return errorResponse;
  }
}

type TCreateBucket = {
  success: boolean;
  bucketId: string | null;
  error: string | null;
};
export async function createBucketServer(
  html: string,
  css: string,
): Promise<TCreateBucket> {
  try {
    const response = await axios.post(`${ADDRESS}/create_bucket`, {
      html,
      css,
    });
    if (response.status == 200) {
      const responseData = response.data as TCreateBucket;
      return responseData;
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const errorResponse: TCreateBucket = {
      success: false,
      bucketId: null,
      error: catchError.message,
    };
    return errorResponse;
  }
}

type TFetchWebpage = {
  bucketId: string | null;
  html?: string | null;
  css?: string | null;
  error: string | null;
};
export async function fetchWebpageServer(
  bucketId: string,
): Promise<TFetchWebpage> {
  try {
    const response = await axios.post(`${ADDRESS}/fetch_webpage`, {
      bucketId,
    });
    if (response.status == 200) {
      const responseData = response.data as TFetchWebpage;
      return responseData;
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const errorResponse: TFetchWebpage = {
      bucketId: null,
      error: catchError.message,
    };
    return errorResponse;
  }
}

type TFillBucket = {
  success: boolean;
  bucketId: string | null;
  penpotTree: string | null;
  error: string | null;
};
export async function fillBucketServer(
  bucketId: string,
  penpotTree: string,
): Promise<TFillBucket> {
  try {
    const response = await axios.post(`${ADDRESS}/fill_bucket`, {
      bucketId,
      penpotTree,
    });
    if (response.status == 200) {
      const responseData = response.data as TFillBucket;
      return responseData;
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const errorResponse: TFillBucket = {
      success: false,
      bucketId: null,
      penpotTree: null,
      error: catchError.message,
    };
    return errorResponse;
  }
}
