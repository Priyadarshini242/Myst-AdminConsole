import React, { useEffect } from "react";
import { Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/atoms/Buttons/ActionButton";
import useContentLabel from "../../../../hooks/useContentLabel";

const Unauthorized = ({ message }) => {
  const navigate = useNavigate();
  const contentLabel = useContentLabel();

  useEffect(() => {
    sessionStorage.removeItem('auth_key');
  }, []);

  const handleNavigate = () => {
    navigate("/skill-owner/email");
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ width: "24rem", textAlign: "center" }}>
        <Card.Body>
          <Card.Title>
            {contentLabel("AccessDenied", "nf Access Denied")}
          </Card.Title>
          <Card.Text>
            {message
              ? message
              : contentLabel(
                  "DontHavePermissionToAccess",
                  "You do not have permission to access. Please contact your administrator if you believe this is an error."
                )}
          </Card.Text>
          <ActionButton label={contentLabel('Back', 'nf Back')} onClick={handleNavigate} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Unauthorized;
