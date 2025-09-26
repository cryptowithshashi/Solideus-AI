FROM trailofbits/eth-security-toolbox:latest

# Set working directory
WORKDIR /analysis

# Copy analysis scripts
COPY run-slither.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/run-slither.sh

# Security: Run as non-root user
RUN useradd -m -u 1001 analyzer
USER analyzer

ENTRYPOINT ["/usr/local/bin/run-slither.sh"]