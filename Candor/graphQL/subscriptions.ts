import { gql } from "@apollo/client";

export const LISTEN_MESSAGES = gql`
  subscription ListenMessages($msgToken: String!, $anonymousUserId: String!) {
    ListenMessages(msg_token: $msgToken, anonymous_user_id: $anonymousUserId) {
      message
      created_at
      receiver_id
      sender_id
    }
  }
`;
