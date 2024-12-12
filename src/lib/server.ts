import axios from "axios";

const ADDRESS = "http://localhost:3000";

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
    if (response.status == 505 || response.status == 200) {
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
    if (response.status == 505 || response.status == 200) {
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
